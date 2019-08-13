#! /usr/bin/env node

const path = require("path");
const resolveConfig = require("../lib/resolveConfig.js");
const resolvePrefix = require("../lib/resolvePrefix.js");
const cleanCache = require("../lib/utils/cleanCache.js");
const keppProcess = require("./shell.js");
const fs = require("fs");
const serverStart = require("./mock-start.js");
let config = null;

// try {
let configPath = resolvePrefix(resolveConfig("path"));

// 清除require缓存
// configPath
//   ? cleanCache(require.resolve(path.resolve(process.cwd(), configPath)))
//   : cleanCache(require.resolve(path.resolve(process.cwd(), "mock.config.js")));

// 监听
if (configPath) {
  console.log("执行监听>>>>>>>>>>>");
  fs.watch(
    configPath
      ? process.cwd() + "/" + configPath
      : process.cwd() + "/" + "mock.config.js",
    { recursive: true },
    function(evt, name) {
      console.log("有变化", process.cwd(), configPath);
      keppProcess(
        require(path.resolve(process.cwd(), configPath)),
        configPath ? configPath : "mock.config.js"
      );
      process.exit(0);
    }
  );
}

// 接收父进程传递的config
process.on("message", function(obj) {
  // console.log("子进程中获取到config：", obj.config);
  if (obj.config) serverStart(obj.config, false);
  // 多次监听
  console.log("执行监听>>>>>>>>>>>");
  fs.watch(process.cwd() + "/" + obj.configPath, { recursive: true }, function(
    evt,
    name
  ) {
    console.log("有变化", process.cwd(), obj.configPath);
    keppProcess(
      require(path.resolve(process.cwd(), obj.configPath)),
      obj.configPath
    );
    process.exit(0);
  });
});

console.log("configPath", configPath);
try {
  if (configPath) {
    config = require(path.resolve(process.cwd(), configPath));
  } else {
    config = require(path.resolve(process.cwd(), "mock.config.js")) || null;
  }
} catch (e) {
  config = null;
}

console.log(">>>", config);
if (config) serverStart(config);

/**
 *

 */
// } catch (e) {
//   throw Error(
//     "未找到mockServer配置文件，请确认根目录有mock.config.js配置文件!",
//     e
//   );
// }
