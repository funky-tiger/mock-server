#! /usr/bin/env node

const child_process = require("child_process");
const path = require("path");
const chalk = require("chalk");
const resolveConfig = require("../lib/utils/resolveConfig.js");
const resolvePrefix = require("../lib/utils/resolvePrefix.js");
const mockServers = require("./mock-servers.js");

let configPath = resolvePrefix(resolveConfig("path"));
let config = null;

try {
  if (configPath) {
    config = require(path.resolve(process.cwd(), configPath));
  } else {
    config = require(path.resolve(process.cwd(), "mock.config.js")) || null;
  }
  child_process.exec(
    `node ${path.resolve(__dirname, "./mock-servers.js")}`,
    function(err, stdout, stderr) {
      if (err) {
        return console.log(chalk.red.bold("💔  ", err));
      }
      if (configPath) {
        mockServers(config, configPath);
      } else {
        mockServers(config, "mock.config.js");
      }
    }
  );
} catch (e) {
  if (e.code === "MODULE_NOT_FOUND") {
    console.log(
      chalk.red.bold(
        "💔  未找到MockServers配置文件，请指定配置文件或确认根目录有mock.config.js配置文件..."
      )
    );
    // throw new Error(
    //   "未找到mockServer配置文件，请确认根目录有mock.config.js配置文件!",
    //   e
    // );
  }
}
