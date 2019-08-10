const fs = require("fs");
const baseDir = process.cwd();

let opts = {
  cwd: baseDir,
  encoding: "utf8",
  stdio: [process.stdin, process.stdout, process.stderr]
};

saveProxyData = (path, url, data) => {
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
    // console.log("非首次备份", Object.keys(content));
    let proxyDataArr = Object.keys(content);
    console.log(content);
    let keyIndex = Object.keys(content).indexOf(url);
    if (proxyDataArr[keyIndex] === url) {
    } else {
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
