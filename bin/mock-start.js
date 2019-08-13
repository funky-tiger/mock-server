#! /usr/bin/env node
const Compiler = require("../lib/Compiler.js");
const resolveConfig = require("../lib/resolveConfig.js");
const resolvePrefix = require("../lib/resolvePrefix.js");
const { resolveMockApiList } = require("../lib/router");
let configPath = resolvePrefix(resolveConfig("path"));
module.exports = function serverStart(config) {
  resolveMockApiList(config);
  let compiler = new Compiler(config);
  compiler.run(configPath);
};
