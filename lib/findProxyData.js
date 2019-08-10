const fs = require("fs");
const baseDir = process.cwd();

findProxyData = (path, url) => {
  let dirName = baseDir + "/" + path;
  let isExist = fs.existsSync(dirName);

  if (!isExist) {
    return false;
  }

  let fileName = dirName + "/backup.json";

  try {
    let content = JSON.parse(fs.readFileSync(fileName, "utf-8"));
    let proxyDataArr = Object.keys(content);
    let keyIndex = Object.keys(content).indexOf(url);
    if (proxyDataArr[keyIndex] === url) {
      return content[url];
    } else {
      return false;
    }
  } catch (e) {
    return false;
  }
};
module.exports = findProxyData;
