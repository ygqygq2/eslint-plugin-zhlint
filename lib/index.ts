module.exports = {
  rules: {
    // import all rules in lib/rules
    ...require("requireindex")(__dirname + "/rules"),
  },
};
