/*
 * @LastEditors: Tiger
 * @Description: In User Settings Edit
 * @Author: Tiger
 * @Date: 1985-10-26 16:15:00
 * @LastEditTime: 2019-08-20 19:23:48
 */
var express = require("express");
var router = null;
const path = require("path");
router = express.Router();

// 此处加载的中间件也可以自动更新
// router.use(express.static("public"));

function checkPathPrefix(path) {
  switch (path[0]) {
    case ".":
  }
}
const resolveMockApiList = (config, configPath) => {
  console.log("configPath", configPath);
  if (configPath && config.mockPath) {
    // console.log(config.mockPath, "\n", configPath);
    // console.log(path.resolve(configPath));
    let _config_path_arr = path.resolve(configPath).split("/");
    _config_path_arr = _config_path_arr.filter(function(v, i, ar) {
      return i !== _config_path_arr.length - 1;
    });
    let _config_path = _config_path_arr.join("/");

    let mockJsonPath = path.resolve(_config_path, config.mockPath);
    try {
      let mockJSON = require(mockJsonPath);
      let mockDataKeys = Object.keys(mockJSON);
      let mockDataValues = Object.values(mockJSON);
      let mockPathArr = [];
      for (let i = 0; i < mockDataKeys.length; i++) {
        let _obj = {};
        let arr = mockDataKeys[i].split(" ");
        _obj.method = arr[0];
        _obj.path = arr[1];
        _obj.data = mockDataValues[i];
        mockPathArr.push(_obj);
      }
      mockPathArr.forEach(item => {
        switch (item.method.toUpperCase()) {
          case "GET":
            router.get(checkPath(item.path), (req, res) => {
              res.send(item.data);
            });
            break;
          case "POST":
            router.post(checkPath(item.path), (req, res) => {
              res.send(item.data);
            });
            break;
          default:
            router.get(checkPath(item.path), (req, res) => {
              res.send(item.data);
            });
            return;
        }
      });
    } catch (e) {}
  }

  let apiList = config.mockData.apiList;
  apiList.forEach(item => {
    switch (item.method.toUpperCase()) {
      case "GET":
        router.get(checkPath(item.path), (req, res) => {
          res.send(
            checkFormat(
              item.data,
              config.mockData && config.mockData.format
                ? config.mockData.format
                : {}
            )
          );
        });
        break;
      case "POST":
        router.post(checkPath(item.path), (req, res) => {
          res.send(
            checkFormat(
              item.data,
              config.mockData && config.mockData.format
                ? config.mockData.format
                : {}
            )
          );
        });
        break;
      default:
        router.get(checkPath(item.path), (req, res) => {
          res.send(
            checkFormat(
              item.data,
              config.mockData && config.mockData.format
                ? config.mockData.format
                : {}
            )
          );
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
  console.log("formatformatformat", format);
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
