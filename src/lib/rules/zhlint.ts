import { AST_NODE_TYPES } from '@typescript-eslint/experimental-utils/dist/ts-eslint';
import { Rule } from 'eslint';
import * as zhlint from 'zhlint';

interface ZHLintOptions {
  ignore?: string[];
  whitelist?: string[];
  severity?: number;
}

interface ZHLintResult {
  message: string;
  offset: number;
  severity: number;
}

const createRule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description: 'enforce Chinese punctuation and typography.',
      category: 'Stylistic Issues',
      recommended: true,
      url: 'https://github.com/ygqygq2/eslint-plugin-zhlint',
    },
    schema: [
      {
        type: 'object',
        properties: {
          ignore: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          whitelist: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          severity: {
            type: 'number',
            minimum: 0,
            maximum: 2,
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const zhlintOptions: ZHLintOptions = context.options[0] || {};
    const ignore = zhlintOptions.ignore || [];
    const whitelist = zhlintOptions.whitelist || [];
    const severity = zhlintOptions.severity || 1;
    const sourceCode = context.getSourceCode();

    function tryRunZhlint(
      context: Rule.RuleContext,
      sourceCode: ReturnType<typeof context.getSourceCode>,
      endOffset: number,
      beginOffset: number,
      node: Rule.Node,
      value: string,
      zhlintOptions: ZHLintOptions,
    ) {
      const results: ZHLintResult[] = zhlint(value, {
        ignore: zhlintOptions.ignore,
        whitelist: zhlintOptions.whitelist,
      }).map((msg) => ({
        message: msg.message,
        offset: msg.index + beginOffset,
        severity: zhlintOptions.severity || 1,
      }));
      results.forEach((msg) => {
        const startPos = sourceCode.getLocFromIndex(msg.offset);
        context.report({
          loc: {
            start: startPos,
            end: { line: startPos.line, column: startPos.column + 1 },
          },
          message: msg.message,
          severity: msg.severity,
        });
      });
    }

    return {
      [`TemplateLiteral > .${AST_NODE_TYPES.TemplateElement}`](node: Rule.Node) {
        if (node.parent.type === AST_NODE_TYPES.TaggedTemplateExpression) {
          return;
        }

        const source = node.value.raw;
        tryRunZhlint(context, sourceCode, node.end, node.start, node, source, zhlintOptions);
      },
      Literal(node: Rule.Node) {
        if (typeof node.value === 'string') {
          const endOffset = node.range[1];
          const beginOffset = node.range[0];
          tryRunZhlint(context, sourceCode, endOffset, beginOffset, node, node.value, zhlintOptions);
        }
      },
      TemplateLiteral(node: Rule.Node) {
        const endOffset = node.range[1];
        const beginOffset = node.range[0];
        const value = sourceCode.getText(node);
        tryRunZhlint(context, sourceCode, endOffset, beginOffset, node, value, zhlintOptions);
      },
    };
  },
};
