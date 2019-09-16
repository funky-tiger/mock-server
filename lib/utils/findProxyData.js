const fs = require("fs");
const baseDir = process.cwd();
const fixUrlPar = require("./fixUrlParams.js");

findProxyData = (path, url, method, checkParams, params) => {
  let dirName = baseDir + "/" + path;
  let isExist = fs.existsSync(dirName);

  if (!isExist) {
    return false;
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
        return content[`${method} ${url} ${fixUrlPar(params)}`];
      } else {
        return false;
      }
    } else {
      keyIndex = Object.keys(content).indexOf(`${method} ${url}`);
      if (proxyDataArr[keyIndex] === `${method} ${url}`) {
        return content[`${method} ${url}`];
      } else {
        return false;
      }
    }
  } catch (e) {
    return false;
  }
};
module.exports = findProxyData;
