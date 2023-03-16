const rule = require("../../../lib/rules/zhlint");
const RuleTester = require("eslint").RuleTester;

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2018 } });
ruleTester.run("zhlint", rule, {
  valid: [
    `"你好 abc"`,
  ],
  invalid: [
    {
      code: `"你好abc"`,
      errors: [
        {
          messageId: "zhlint",
        },
      ],
      // output: `"你好 abc"`,
    },
  ],
});
