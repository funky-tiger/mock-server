#! /usr/bin/env node
const chalk = require("chalk");
const MockServers = require("../lib/MockServers.js");
const resolveConfig = require("../lib/utils/resolveConfig.js");
const resolvePrefix = require("../lib/utils/resolvePrefix.js");
const { resolveMockApiList } = require("../lib/router");

let configPath = resolvePrefix(resolveConfig("path"));
module.exports = function serverStart(config, configPath) {
  try {
    if (
      config.mockData &&
      config.mockData.apiList &&
      Array.isArray(config.mockData.apiList)
    ) {
      resolveMockApiList(config, configPath);
    }
    let mockservers = new MockServers(config);
    mockservers.run(configPath);
  } catch (e) {
    return console.log(chalk.red.bold("💔  ", e));
  }
};
