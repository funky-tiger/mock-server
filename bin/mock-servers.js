#! /usr/bin/env node

const path = require("path");
const resolveConfig = require("../lib/resolveConfig.js");
const resolvePrefix = require("../lib/resolvePrefix.js");
const cleanCache = require("../lib/utils/cleanCache.js");
const watchProcess = require("./watchProcess.js");
const net = require("net");
const fs = require("fs");
const watch = require("node-watch");
const serverStart = require("./mock-start.js");
const killPort = require("../lib/utils/killport.js");
const CheckPort = require("../lib/utils/CheckPort.js");

function mockServers(config, configPath) {
  if (config) {
    CheckPort(config.mockServer.port).then(res => {
      if (res) {
        // 端口未占用
        makeServerProcess();
      } else {
        //端口占用
        killPort(config.mockServer.port, function() {
          makeServerProcess();
        });
      }
    });
  } else {
    // 非第一次更改
    makeServerProcess();
  }

  function makeServerProcess() {
    if (configPath) {
      watch(
        configPath
          ? process.cwd() + "/" + configPath
          : process.cwd() + "/" + "mock.config.js",
        { recursive: true },
        function(evt, name) {
          console.log("有变化", process.cwd(), "/" + configPath);
          watchProcess(
            require(path.resolve(process.cwd(), configPath)),
            configPath ? configPath : "mock.config.js"
          );
          process.exit(0);
        }
      );
    }
    process.on("message", function(obj) {
      if (obj.config) serverStart(obj.config, false);
      // 多次监听
      watch(process.cwd() + "/" + obj.configPath, { recursive: true }, function(
        evt,
        name
      ) {
        console.log("有变化", process.cwd(), obj.configPath);
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
