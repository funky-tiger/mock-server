/*
 * @LastEditors: Tiger
 * @Description: In User Settings Edit
 * @Author: Tiger
 * @Date: 1985-10-26 16:15:00
 * @LastEditTime: 2019-08-20 19:24:15
 */
const fs = require("fs");
const baseDir = process.cwd();
const chalk = require("chalk");
const http = require("http");

saveProxyFile = (path, url, proxy) => {
  let _url = proxy + url;
  // console.log("静态资源地址:", _url);
  // console.log("保存的路径：", path);
  let dirName = baseDir + "/" + path + "/static";
  let isExist = fs.existsSync(dirName);
  let result = "123";
  return new Promise((resolve, reject) => {
    if (!isExist) {
      fs.mkdirSync(dirName, { recursive: true }, err => {
        if (err) {
          throw err;
        } else {
          console.log("ok!");
        }
      });
    }
    let filename = url
      .split("/")
      .filter(item => {
        return item;
      })
      .join("-");
    let _prefix = url.split(".")[url.split(".").length - 1];
    let fileName = dirName + `/${filename}`;
    // console.log("静态资源后缀：", _prefix);
    // console.log("文件名:", filename);
    // console.log("文件保存路径:", fileName);

    fs.access(fileName, fs.R_OK | fs.W_OK, err => {
      if (err) {
        console.log(
          chalk.blue.bold(`👌  请求到资源 ${filename} ，资源备份中...`)
        );
        http.get(_url, function(response) {
          let _staticdata = "";
          response.setEncoding("binary");
          response.on("data", function(chunk) {
            _staticdata += chunk;
          });
          response.on("end", function() {
            fs.writeFileSync(fileName, _staticdata, "binary");
            console.log(chalk.yellow.bold(`👌  资源 ${filename} 保存完毕`));
          });
        });
        resolve({ _url, filename });
      }
      resolve(fileName);
    });
  });
};

module.exports = saveProxyFile;
