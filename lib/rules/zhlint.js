const zhlint = require("zhlint");
const { ESLint } = require("eslint");

function tryRunZhlint(context, sourceCode, endOffset, beginOffset, node, value, zhlintOptions) {
  try {
    const { result, validations } = zhlint.run(value, zhlintOptions);
    validations.forEach((validation) => {
      context.report({
        node,
        loc: {
          start: sourceCode.getLocFromIndex(node.range[0] + beginOffset + validation.index),
          end: sourceCode.getLocFromIndex(node.range[0] + beginOffset + validation.index + validation.length),
        },
        messageId: "zhlint",
        data: {
          zhlintRuleName: validation.name,
          zhlintMsg: validation.message,
        },
        fix(fixer) {
          return fixer.replaceTextRange([node.range[0] + beginOffset, node.range[1] - endOffset], result);
        },
      });
    });
  } catch (e) {
    console.error(e);
  }
}

module.exports = {
  meta: {
    type: "layout",
    docs: {
      url: "https://github.com/Jinjiang/zhlint#supported-rules",
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          zhlint: {
            type: "object",
          },
          lintComments: {
            type: "boolean",
          },
          lintStringLiterals: {
            type: "boolean",
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      zhlint: "[zhlint/{{ zhlintRuleName }}] {{ zhlintMsg }}",
    },
  },
  create(context) {
    const sourceCode = context.getSourceCode();
    const { zhlint: zhlintOptions, ...ruleOptions } = {
      lintComments: true,
      lintStringLiterals: true,
      ...context.options[0],
    };
    return {
      Program() {
        if (!ruleOptions.lintComments) return;
        const comments = sourceCode.getAllComments();
        comments
          .filter((token) => token.type !== "Shebang")
          .forEach((node) => {
            tryRunZhlint(context, sourceCode, 2, node.type === "Block" ? 2 : 0, node, node.value, zhlintOptions);
          });
      },
      Literal(node) {
        if (!ruleOptions.lintStringLiterals) return;
        if (typeof node.value !== "string") return;
        tryRunZhlint(context, sourceCode, 1, 1, node, node.value, zhlintOptions);
      },
      TemplateElement(node) {
        if (!ruleOptions.lintStringLiterals) return;
        tryRunZhlint(context, sourceCode, 1, 1, node, node.value.cooked, zhlintOptions);
      },
    };
  },
};
