var express = require("express");
var router = null;
router = express.Router();

// 此处加载的中间件也可以自动更新
// router.use(express.static("public"));

const resolveMockApiList = config => {
  let apiList = config.mockData.apiList;
  if (!apiList || !Array.isArray(apiList) || apiList.length === 0) {
    return {
      error: 1,
      source: "mock",
      message: `Please appoint mock-server's mockData && apiList || format`
    };
  }
  apiList.forEach(item => {
    switch (item.method.toUpperCase()) {
      case "GET":
        router.get(checkPath(item.path), (req, res) => {
          res.send(checkFormat(item.data, config.mockData.format));
        });
        break;
      case "POST":
        router.post(checkPath(item.path), (req, res) => {
          res.send(checkFormat(item.data, config.mockData.format));
        });
        break;
      default:
        router.get(checkPath(item.path), (req, res) => {
          res.send(checkFormat(item.data, config.mockData.format));
        });
        return;
    }
  });
};
function checkPath(path) {
  // fix: 请求路径首位 /
  return path[0] !== "/" ? "/" + path : path;
}
function checkFormat(data, format) {
  // fix: 返回数据嵌套format
  if (JSON.stringify(format) == "{}" || !format) {
    return checkDataSource(data, "mock");
  } else {
    let formatCopy = format;
    formatCopy.data = data;
    formatCopy.source = "mock";
    return formatCopy;
  }
}

function checkDataSource(data, source) {
  if (Array.isArray(data) || typeof data !== "object" || typeof data === null) {
    // console.log("A:数组 / 常量 / null");
    return { source, data };
  } else {
    // console.log("B:JSON", data);
    let finalData = data;
    finalData.source = source;
    return finalData;
  }
}

module.exports = { router, resolveMockApiList };
