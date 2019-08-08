#! /usr/bin/env node

const path = require("path");
let config = null;
try {
  config = require(path.resolve("mock.server.js"));
} catch (e) {
  throw Error("未找到mockServer配置文件，请确认根目录有mock.server.js配置文件");
}

let Compiler = require("../lib/Compiler.js");
let compiler = new Compiler(config);
// // 标识运行编译
compiler.run();
