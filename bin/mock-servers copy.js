#! /usr/bin/env node

const path = require("path");
const Compiler = require("../lib/Compiler.js");
const resolveConfig = require("../lib/resolveConfig.js");
const resolvePrefix = require("../lib/resolvePrefix.js");
const cleanCache = require("../lib/utils/cleanCache.js");
const keppProcess = require("./shell.js");
const fs = require("fs");
const { resolveMockApiList } = require("../lib/router");
const serverStart = require("./mock-start.js");
let config = null;
// try {
let configPath = resolvePrefix(resolveConfig("path"));

process.on("message", function(config) {
  console.log(JSON.stringify(config));
});
if (configPath) {
  config = require(path.resolve(process.cwd(), configPath));

  fs.watch(process.cwd() + "/" + configPath, { recursive: true }, function(
    evt,
    name
  ) {
    console.log("有变化");
    console.log("进程即将退出");
    keppProcess(config);

    process.exit(0);

    // cleanCache(require.resolve(path.resolve(process.cwd(), configPath)));
    // config = null;
    // config = require(path.resolve(process.cwd(), configPath));
    // keppProcess(config);
    // process.exit(0);

    // cleanCache(require.resolve(path.resolve(process.cwd(), configPath)));
    // config = null;
    // config = require(path.resolve(process.cwd(), configPath));
    // restart(config);
  });
} else {
  config = require(path.resolve(process.cwd(), "mock.config.js"));
}

// } catch (e) {
//   throw Error(
//     "未找到mockServer配置文件，请确认根目录有mock.config.js配置文件!",
//     e
//   );
// }
serverStart(config);
