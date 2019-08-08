const fs = require("fs");
const baseDir = __dirname;

let fileName = baseDir + "/ProxyData.json";

let opts = {
  cwd: baseDir,
  encoding: "utf8",
  stdio: [process.stdin, process.stdout, process.stderr]
};

saveProxyData = (url, data) => {
  try {
    let content = JSON.parse(fs.readFileSync(fileName, "utf-8"));
    // console.log("非首次备份", Object.keys(content));
    let proxyDataArr = Object.keys(content);
    let keyIndex = Object.keys(content).indexOf(url);
    if (proxyDataArr[keyIndex] === url) {
      // console.log("已备份过该条数据");
    } else {
      // console.log("未备份该条数据，正在备份中...");
      content[url] = data;
      fs.writeFileSync(fileName, JSON.stringify(content), opts);
    }
  } catch (e) {
    // console.log("首次备份");
    let obj = {};
    obj[url] = data;
    fs.writeFileSync(fileName, JSON.stringify(obj), opts);
  }
};
module.exports = saveProxyData;
