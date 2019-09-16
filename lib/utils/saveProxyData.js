/*
 * @LastEditors: Tiger
 * @Description: In User Settings Edit
 * @Author: Tiger
 * @Date: 1985-10-26 16:15:00
 * @LastEditTime: 2019-08-20 19:19:04
 */
const fs = require("fs");
const baseDir = process.cwd();
const chalk = require("chalk");
const fixUrlPar = require("./fixUrlParams.js");

saveProxyData = (path, url, data, method, checkParams, params) => {
  let dirName = baseDir + "/" + path;
  let isExist = fs.existsSync(dirName);

  if (!isExist) {
    fs.mkdirSync(dirName, { recursive: true }, err => {
      if (err) {
        throw err;
      } else {
        console.log("ok!");
      }
    });
  }
  let fileName = dirName + "/backup.json";

  try {
    let content = JSON.parse(fs.readFileSync(fileName, "utf-8"));
    let proxyDataArr = Object.keys(content);

    let keyIndex = -1;
    if (method === "GET" && checkParams) {
      keyIndex = Object.keys(content).indexOf(
        `${method} ${url} ${fixUrlPar(params)}`
      );
      if (proxyDataArr[keyIndex] === `${method} ${url} ${fixUrlPar(params)}`) {
      } else {
        content[`${method} ${url} ${fixUrlPar(params)}`] = data;
        fs.writeFileSync(fileName, JSON.stringify(content, null, 2), "utf8");
        console.log(
          chalk.blue.bold(
            `👌  请求到接口 ${method}-${url} 数据，已备份到backup.json中.`
          )
        );
      }
    } else {
      keyIndex = Object.keys(content).indexOf(`${method} ${url}`);
      if (proxyDataArr[keyIndex] === `${method} ${url}`) {
      } else {
        content[`${method} ${url}`] = data;
        fs.writeFileSync(fileName, JSON.stringify(content, null, 2), "utf8");
        console.log(
          chalk.blue.bold(
            `👌  请求到接口 ${method}-${url} 数据，已备份到backup.json中.`
          )
        );
      }
    }
  } catch (e) {
    let obj = {};
    if (method === "GET" && checkParams) {
      let _params = fixUrlPar(params);
      /*
        GET /api/common/getCategory categoryId=2&pageIndex=1
      */
      obj[`${method} ${url} ${_params}`] = data;
    } else {
      obj[`${method} ${url}`] = data;
    }
    fs.writeFileSync(fileName, JSON.stringify(obj, null, 2), "utf8");
    console.log(
      chalk.blue.bold(
        `👌  请求到接口 ${method}-${url} 数据，已备份到backup.json中.`
      )
    );
  }
};

module.exports = saveProxyData;
