#! /usr/bin/env node
const path = require("path");
const child_process = require("child_process");
const cleanCache = require("../lib/utils/cleanCache.js");

module.exports = function keppProcess(config, configPath) {
  console.log("开启进程守护中...");
  // child_process.exec("npm -v", function(err, stdout) {
  //   if (err) console.log(err);
  //   console.log("新变化", config);
  //   console.log("执行 npm -v", stdout);
  // });

  cleanCache(require.resolve(path.resolve(__dirname, "./mock-servers.js")));

  let worker = null;
  worker = child_process.fork(path.resolve(__dirname, "./mock-servers.js"));
  worker.on("exit", function() {
    delete worker;

    console.log(`worker:[${worker.pid}] is exited...`);

    worker = child_process.fork(path.resolve(__dirname, "./mock-servers.js"));
  });

  if (config) worker.send({ config, configPath });

  // //保存被子进程实例数组
  // var workers = [];
  // //这里的被子进程理论上可以无限多
  // var appsPath = [path.resolve(__dirname, "./mock-servers.js")];
  // var createWorker = function(appPath) {
  //   //保存fork返回的进程实例
  //   var worker = child_process.fork(appPath);
  //   //监听子进程exit事件
  //   console.log("1:", worker);
  //   worker.on("exit", function() {
  //     console.log("worker:" + worker.pid + "exited");
  //     delete workers[worker.pid];
  //     createWorker(appPath);
  //   });
  //   console.log("2:", worker.pid);
  //   workers[worker.pid] = worker;
  //   console.log("Create worker:" + worker.pid);
  // };
  // //启动所有子进程
  // for (var i = appsPath.length - 1; i >= 0; i--) {
  //   createWorker(appsPath[i]);
  // }
  // //父进程退出时杀死所有子进程
  // process.on("exit", function() {
  //   for (var pid in workers) {
  //     workers[pid].kill();
  //   }
  // });
};
