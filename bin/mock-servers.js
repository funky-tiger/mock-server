#! /usr/bin/env node

const path = require("path");
const chalk = require("chalk");
const watch = require("node-watch");
const watchProcess = require("./watchProcess.js");
const serverStart = require("./mock-start.js");
const cleanCache = require("../lib/utils/cleanCache.js");
const killPort = require("../lib/utils/killport.js");
const CheckPort = require("../lib/utils/CheckPort.js");

function mockServers(config, configPath) {
  if (config) {
    CheckPort(config.mockServer.port).then(res => {
      if (res) {
        // 端口未占用
        makeServerProcess(configPath);
      } else {
        //端口占用
        killPort(config.mockServer.port, function() {
          makeServerProcess(configPath);
        });
      }
    });
  } else {
    // 非第一次更改
    makeServerProcess(configPath);
  }

  function makeServerProcess(configPath) {
    if (configPath) {
      watch(process.cwd() + "/" + configPath, { recursive: true }, function(
        evt,
        name
      ) {
        if (evt === "remove") {
          console.log(
            chalk.red.bold("💔  配置文件丢失，请确认配置文件名称和位置!")
          );
          return;
        }
        console.log(
          chalk.blue.bold(`👉  检测到./${configPath}变化, 自动重启中...`)
        );
        watchProcess(
          require(path.resolve(process.cwd(), configPath)),
          configPath
        );
        process.exit(0);
      });
    }
    process.on("message", function(obj) {
      if (obj.config) serverStart(obj.config, false);
      // 多次监听
      watch(process.cwd() + "/" + obj.configPath, { recursive: true }, function(
        evt,
        name
      ) {
        if (evt === "remove") {
          console.log(
            chalk.red.bold("💔  配置文件丢失，请确认配置文件名称和位置!")
          );
          return;
        }
        console.log(
          chalk.blue.bold(`👉  检测到./${obj.configPath}变化, 自动重启中...`)
        );
        watchProcess(
          require(path.resolve(process.cwd(), obj.configPath)),
          obj.configPath
        );

        process.exit(0);
      });
    });

    if (config) serverStart(config);
  }
}
mockServers();
module.exports = mockServers;
