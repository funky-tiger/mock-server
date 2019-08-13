#! /usr/bin/env node
const path = require("path");
const child_process = require("child_process");
const cleanCache = require("../lib/utils/cleanCache.js");

module.exports = function watchProcess(config, configPath) {
  console.log("开启进程守护中...", configPath);
  // process.on("SIGINT", function() {
  //   console.log("要退出吗?");
  //   setTimeout(function() {
  //     console.log("已退出！");
  //     process.exit(0);
  //   }, 1000);
  // });

  // child_process.exec("npm -v", function(err, stdout) {
  //   if (err) console.log(err);
  //   console.log("新变化", config);
  //   console.log("执行 npm -v", stdout);
  // });

  cleanCache(require.resolve(path.resolve(__dirname, "./mock-servers.js")));

  let worker = null;
  worker = child_process.fork(path.resolve(__dirname, "./mock-servers.js"));
  // 接收退出信号
  worker.on("SIGINT", function() {
    console.log("要退出吗?");
  });

  worker.on("exit", function() {
    delete worker;

    console.log(`worker:[${worker.pid}] is exited...`);
    // process.exit()
    worker = child_process.fork(path.resolve(__dirname, "./mock-servers.js"));
  });

  if (config) {
    worker.send({ config, configPath });
  }
};
