import { resolve } from "path";

const rulesDir = resolve(__dirname, "rules");
const rules = require("requireindex")(rulesDir);

module.exports = {
  rules: {
    ...rules,
  },
};
