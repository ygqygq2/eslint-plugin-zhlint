const zhlint = require("zhlint");
const { ESLint } = require("eslint");
const path = require("path");

const myPlugin = {
  rules: {
    "zhlint/zhlint": require("./lib/rules/zhlint"),
  },
};

const eslint = new ESLint({
  overrideConfig: {
    plugins: ["@ygqygq2/zhlint"],
    parser: "@typescript-eslint/parser",
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
    },
    rules: {
      "@ygqygq2/zhlint/zhlint": "error",
    },
  },
  useEslintrc: false,
});

(async () => {
  const filePath = path.resolve(__dirname, "test.js");
  const results = await eslint.lintFiles([filePath]);
  console.log(results);
})();
