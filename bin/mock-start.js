#! /usr/bin/env node
const Compiler = require("../lib/Compiler.js");
const resolveConfig = require("../lib/utils/resolveConfig.js");
const resolvePrefix = require("../lib/utils/resolvePrefix.js");
const { resolveMockApiList } = require("../lib/router");

let configPath = resolvePrefix(resolveConfig("path"));
module.exports = function serverStart(config) {
  try {
    resolveMockApiList(config);
    let compiler = new Compiler(config);
    compiler.run(configPath);
  } catch (e) {
    return console.log(chalk.red.bold("💔  ", e));
  }
};
