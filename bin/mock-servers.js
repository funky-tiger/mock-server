#! /usr/bin/env node

const path = require("path");
const Compiler = require("../lib/Compiler.js");
const resolveConfig = require("../lib/resolveConfig.js");
const resolvePrefix = require("../lib/resolvePrefix.js");

let config = null;

let configPath = resolvePrefix(resolveConfig("path"));
// console.log("configPath", configPath);
try {
  if (configPath) {
    config = require(path.resolve(process.cwd(), configPath));
  } else {
    config = require(path.resolve(process.cwd(), "mock.config.js"));
  }
  // console.log("读取config：", config);
} catch (e) {
  throw Error(
    "未找到mockServer配置文件，请确认根目录有mock.config.js配置文件!",
    e
  );
}

let compiler = new Compiler(config);
// 标识 运行编译
compiler.run(configPath);
