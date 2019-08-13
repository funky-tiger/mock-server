#! /usr/bin/env node

const child_process = require("child_process");
const path = require("path");
const resolveConfig = require("../lib/resolveConfig.js");
const resolvePrefix = require("../lib/resolvePrefix.js");
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
        return console.log(err);
      }
      mockServers(config, configPath);
    }
  );
} catch (e) {
  if (e.code === "MODULE_NOT_FOUND") {
    throw new Error("未找到mock.config.js配置文件");
  }
}
