#! /usr/bin/env node

const child_process = require("child_process");

module.exports = function killPort(port, cb) {
  let order = `lsof -i :${port}`;
  child_process.exec(order, function(
    // child_process.exec(`node ${path.resolve(__dirname, "./killo.js")}`, function(
    err,
    stdout,
    stderr
  ) {
    if (err) {
      return console.log("杀掉端口出错", err);
    }
    stdout.split("\n").filter(function(line) {
      var p = line.trim().split(/\s+/);
      var address = p[1];
      if (address != undefined && address != "PID") {
        child_process.exec("kill " + address, function(err, stdout, stderr) {
          if (err) {
            return console.log("释放指定端口失败！！");
          }
          console.log("占用指定端口的程序被成功杀掉！");
          cb();
        });
      }
    });
  });
};
