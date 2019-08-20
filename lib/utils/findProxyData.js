const fs = require("fs");
const baseDir = process.cwd();

findProxyData = (path, url, method) => {
  let dirName = baseDir + "/" + path;
  let isExist = fs.existsSync(dirName);

  if (!isExist) {
    return false;
  }

  let fileName = dirName + "/backup.json";

  try {
    let content = JSON.parse(fs.readFileSync(fileName, "utf-8"));
    let proxyDataArr = Object.keys(content);
    // ["GET /api/goods/list","GET /api/goods/list","GET /api/goods/list"]
    let keyIndex = Object.keys(content).indexOf(`${method} ${url}`);
    if (proxyDataArr[keyIndex] === `${method} ${url}`) {
      return content[`${method} ${url}`];
    } else {
      return false;
    }
  } catch (e) {
    return false;
  }
};
module.exports = findProxyData;
