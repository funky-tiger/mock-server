const exec = require("child_process").exec;

let order = `lsof -i :3005`;
exec(order, function(err, stdout, stderr) {
  if (err) {
    return console.log(err);
  }
  stdout.split("\n").filter(function(line) {
    var p = line.trim().split(/\s+/);
    var address = p[1];
    if (address != undefined && address != "PID") {
      exec("kill " + address, function(err, stdout, stderr) {
        if (err) {
          return console.log("释放指定端口失败！！", err);
        }
        // console.log("占用指定端口的程序被成功杀掉！");
      });
    }
  });
});
