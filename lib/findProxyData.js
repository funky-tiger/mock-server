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
    console.log("找到备份文件: ProxyData.json");
    if (proxyDataArr[keyIndex] === url) {
      console.log("找到备份数据:", proxyDataArr[keyIndex]);
      return content[url];
    } else {
      console.log("未找到备份数据", proxyDataArr[keyIndex], url);
      return false;
    }
  } catch (e) {
    console.log("未找到备份文件ProxyData.json");
    return false;
  }
};
module.exports = findProxyData;
