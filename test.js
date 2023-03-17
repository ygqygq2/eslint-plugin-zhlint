const zhlint = require("zhlint");
const { ESLint } = require("eslint");
const path = require("path");

const myPlugin = {
  rules: {
    zhlint: require("./src/lib/rules/zhlint"),
  },
};

const eslint = new ESLint({
  overrideConfig: {
    plugins: ["@ygqygq2/zhlint"],
    rules: {
      "@ygqygq2/zhlint/zhlint": "error",
    },
  },
});

(async () => {
  const filePath = process.argv[2] || path.resolve(__dirname, "test.md");
  const results = await eslint.lintFiles([filePath]);

  console.log(results);
})();
