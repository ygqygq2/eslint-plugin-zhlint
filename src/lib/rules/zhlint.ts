import { Rule } from 'eslint';
import * as ESTree from 'estree';
import * as zhlint from 'zhlint';
import { Options } from 'zhlint/dist/zhlint';

function tryRunZhlint(
  context: Rule.RuleContext,
  sourceCode: ReturnType<typeof context.getSourceCode>,
  endOffset: number,
  beginOffset: number,
  node: any,
  // node: Rule.Node,
  value: string,
  zhlintOptions: Options,
) {
  try {
    const { result, validations } = zhlint.run(value, zhlintOptions);
    validations.forEach((validation) => {
      let start = 0;
      let end = 0;
      if (node.range) {
        [start, end] = node.range;
      } else {
        console.error(`${node.type} is not a range`);
      }
      context.report({
        node,
        loc: {
          start: sourceCode.getLocFromIndex((start as number) + beginOffset + validation.index),
          end: sourceCode.getLocFromIndex((end as number) + beginOffset + validation.index + validation.length),
        },
        messageId: 'zhlint',
        data: {
          zhlintMsg: validation.message,
        },
        fix(fixer) {
          return fixer.replaceTextRange([start + beginOffset, end - endOffset], result);
        },
      });
    });
  } catch (e) {
    // ignored
  }
}

export const meta = {
  type: 'layout',
  docs: {
    url: 'https://github.com/Jinjiang/zhlint#supported-rules',
  },
  fixable: 'code',
  schema: [
    {
      type: 'object',
      properties: {
        zhlint: {
          type: 'object',
        },
        lintComments: {
          type: 'boolean',
        },
        lintStringLiterals: {
          type: 'boolean',
        },
      },
      additionalProperties: false,
    },
  ],
  messages: {
    zhlint: '[zhlint] {{ zhlintMsg }}',
  },
};

export const create = (context: Rule.RuleContext) => {
  const sourceCode = context.getSourceCode();
  const { zhlint: zhlintOptions, ...ruleOptions } = {
    lintComments: true,
    lintStringLiterals: true,
    ...context.options[0],
    zhlint: {
      rules: {
        preset: 'default',
        trimSpace: false, // disabled by default because of false positives
        ...context.options[0]?.zhlint?.rules,
      },
      ...context.options[0]?.zhlint,
    },
  };
  return {
    Program() {
      if (!ruleOptions.lintComments) return;
      const comments: ESTree.Comment[] = sourceCode.getAllComments();
      comments
        // comment.type !== 'Shebang'
        .filter((token) => token.type === 'Block' || token.type === 'Line')
        .forEach((node) => {
          tryRunZhlint(context, sourceCode, 2, node.type === 'Block' ? 2 : 0, node, node.value, zhlintOptions);
        });
    },
    Literal(node) {
      if (!ruleOptions.lintStringLiterals) return;
      if (node && (typeof node.value as any) !== 'string') return;
      tryRunZhlint(context, sourceCode, 1, 1, node, node.value, zhlintOptions);
    },
    TemplateElement(node = { range: [0, 0] }) {
      if (!ruleOptions.lintStringLiterals) return;
      tryRunZhlint(context, sourceCode, 1, 1, node, node.value.cooked, zhlintOptions);
    },
  };
};
