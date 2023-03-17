const { RuleTester } = require("eslint");

import rule from "../../../lib/rules/zhlint";

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
});
ruleTester.run("zhlint", rule, {
  valid: [`"你好 abc"`],
  invalid: [
    {
      code: `"a你好abc"`,
      errors: [
        {
          messageId: "zhlint",
        },
      ],
      // output: `"a 你好 abc"`,
    },
  ],
});
