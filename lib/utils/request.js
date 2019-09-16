/*
 * @LastEditors: Tiger
 * @Description: In User Settings Edit
 * @Author: Tiger
 * @Date: 1985-10-26 16:15:00
 * @LastEditTime: 2019-08-23 15:22:23
 */
const request = require("request");
const saveProxyData = require("../utils/saveProxyData.js");
const findProxyData = require("../utils/findProxyData.js");
const prefixArr = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".mp3", ".mp4"];

function requestProxyResult(url, config, req, checkParams) {
  return new Promise((resolve, reject) => {
    let _params = config.method === "POST" ? req.body : req.query;
    let authorization = config.headers.authorization || {};
    let options =
      config.method === "POST"
        ? {
            url: url, //请求路径
            method: "POST", //请求方式，默认为get
            headers: {
              authorization,
              "content-type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(req.body)
          }
        : {
            url: url + "?" + changeJSON2QueryString(config.body), //请求路径
            method: "GET", //请求方式，默认为get
            headers: {
              authorization,
              "content-type": "application/json;charset=utf-8"
            },
            qs: req.query
          };
    request(options, (error, response, body) => {
      if (error) {
        resolve(checkDataSource(error, "api"));
      }
      if (
        response &&
        response.statusCode &&
        response.statusCode >= 200 &&
        response.statusCode < 400
      ) {
        resolve(checkDataSource(checkJSON(response.body), "api", true));
      } else {
        resolve({
          error: 1,
          code:
            typeof response === "number"
              ? response
              : response.statusCode || 404,
          message: `NetWork Error!`,
          source: "api"
        });
      }
    });
  });
}
function requestTimeOutAllProxyResult(
  reqpath,
  url,
  config,
  timeout,
  backupPathName,
  apiPaths,
  apiList,
  format,
  req,
  checkParams
) {
  let requestTimer = null;
  return new Promise((resolve, reject) => {
    let _params = config.method === "POST" ? req.body : req.query;
    if (!timeout && timeout !== 0) {
      resolve({
        error: 1,
        source: null,
        message: `Please appoint mock-server's timeout`
      });
    }
    requestTimer = setTimeout(() => {
      let restResult = findRestData(
        config,
        reqpath,
        backupPathName,
        apiPaths,
        apiList,
        format,
        checkParams,
        _params
      );
      console.log("restResult: \n", restResult);
      if (!restResult) {
        resolve({
          error: 1,
          source: null,
          message: "timeout over! Not Found Any Data."
        });
      }
      resolve(restResult);
    }, timeout);
    let authorization = config.headers.authorization || {};
    let options =
      config.method === "POST"
        ? {
            url: url, //请求路径
            method: "POST", //请求方式，默认为get
            headers: {
              authorization,
              "content-type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(req.body)
          }
        : {
            url: url + "?" + changeJSON2QueryString(config.body), //请求路径
            method: "GET", //请求方式，默认为get
            headers: {
              authorization,
              "content-type": "application/json;charset=utf-8"
            },
            qs: req.query
          };
    request(options, (error, response, body) => {
      if (error) {
        resolve(checkDataSource(error, "api"));
      }
      if (requestTimer) clearTimeout(requestTimer);
      if (
        response &&
        response.statusCode &&
        response.statusCode >= 200 &&
        response.statusCode < 400
      ) {
        saveProxyData(
          backupPathName,
          reqpath,
          checkJSON(response.body),
          config.method,
          checkParams,
          _params
        );
        resolve(checkDataSource(checkJSON(response.body), "api", true));
      } else {
        // 请求失败 查找剩余数据: 备份数据 / 假数据
        let restResult = findRestData(
          config,
          reqpath,
          backupPathName,
          apiPaths,
          apiList,
          format,
          checkParams,
          _params
        );
        if (!restResult) {
          resolve({
            error: 1,
            code:
              typeof response === "number"
                ? response
                : response.statusCode || 404,
            message: `404 Not Found`,
            source: "api"
          });
        }
        resolve(restResult);
      }
    });
  });
}
function requestOnceProxyResult(
  reqpath,
  url,
  config,
  backupPathName,
  req,
  checkParams
) {
  return new Promise((resolve, reject) => {
    let _params = config.method === "POST" ? req.body : req.query;
    let proxyData = findProxyData(
      backupPathName,
      reqpath,
      config.method,
      checkParams,
      _params
    );
    let authorization = config.headers.authorization || {};

    if (!proxyData) {
      let options =
        config.method === "POST"
          ? {
              url: url,
              method: "POST",
              headers: {
                authorization,
                "content-type": "application/json;charset=utf-8"
              },
              body: JSON.stringify(req.body)
              // POST json格式参数使用body
              // POST form格式参数使用form
              // form: JSON.stringify(req.body)
            }
          : {
              url: url + "?" + changeJSON2QueryString(config.body),
              method: "GET",
              headers: {
                authorization,
                "content-type": "application/json;charset=utf-8"
              },
              qs: req.query
            };
      // console.log("请求配置：", options.body || options.qs);
      request(options, (error, response, body) => {
        if (error) {
          resolve(checkDataSource(error, "api"));
        }
        if (
          response &&
          response.statusCode &&
          response.statusCode >= 200 &&
          response.statusCode < 400
        ) {
          saveProxyData(
            backupPathName,
            reqpath,
            checkJSON(response.body),
            config.method,
            checkParams,
            _params
          );
          resolve(checkDataSource(checkJSON(response.body), "api"));
        } else {
          resolve({
            error: 1,
            code: response || response.statusCode || 404,
            source: "api",
            message: `404 Not Found`
          });
        }
      });
    } else {
      resolve(checkDataSource(proxyData, "backup"));
    }
  });
}
function requestTimeOutProxyResult(
  reqpath,
  url,
  config,
  timeout,
  backupPathName,
  requestedPaths,
  apiPaths,
  apiList,
  format,
  req,
  checkParams
) {
  let requestTimer = null;
  return new Promise((resolve, reject) => {
    let _params = config.method === "POST" ? req.body : req.query;
    if (!timeout && timeout !== 0) {
      resolve({
        error: 1,
        source: null,
        message: `Error: Please appoint mock-server's timeout`
      });
    }
    let isRequested = checkRequested(reqpath, requestedPaths);
    console.log("checkRequested:", isRequested);
    let proxyData = findProxyData(
      backupPathName,
      reqpath,
      config.method,
      checkParams,
      _params
    );
    if (isRequested) {
      // 此处可能有问题， 有备份数据的情况下findRestData函数返回的是false
      // let restResult = findRestData(
      //   config,
      //   reqpath,
      //   backupPathName,
      //   apiPaths,
      //   apiList,
      //   checkParams,
      //   _params
      // );
      requestTimer = setTimeout(() => {
        if (!proxyData) {
          resolve({
            error: 1,
            source: null,
            message: "Error: timeout over! Not Found Any Data."
          });
        }
        resolve(checkDataSource(proxyData, "backup"));
        return;
      }, timeout);
    }
    let authorization = config.headers.authorization || {};
    let options =
      config.method === "POST"
        ? {
            url: url, //请求路径
            method: "POST", //请求方式，默认为get
            headers: {
              authorization,
              "content-type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(req.body)
          }
        : {
            url: url + "?" + changeJSON2QueryString(config.body), //请求路径
            method: "GET", //请求方式，默认为get
            headers: {
              authorization,
              "content-type": "application/json;charset=utf-8"
            },
            qs: req.query
          };
    request(options, (error, response, body) => {
      if (error) {
        resolve(checkDataSource(error, "api", false));
      }
      if (requestTimer) clearTimeout(requestTimer);
      if (
        response &&
        response.statusCode &&
        response.statusCode >= 200 &&
        response.statusCode < 400
      ) {
        saveProxyData(
          backupPathName,
          reqpath,
          checkJSON(response.body),
          config.method,
          checkParams,
          _params
        );
        resolve(checkDataSource(checkJSON(response.body), "api", true));
      } else {
        // 请求失败 查找剩余数据: 备份数据 / 假数据
        let restResult = findRestData(
          config,
          reqpath,
          backupPathName,
          apiPaths,
          apiList,
          checkParams,
          _params
        );
        if (!restResult) {
          try {
            resolve({
              error: 1,
              code: response ? response.statusCode : null,
              source: "api",
              message: response.statusMessage || response.message
            });
          } catch (e) {
            resolve({ source: "api", message: "请求出错" });
          }
        }
        resolve(restResult);
      }
    });
  });
}

function changeJSON2QueryString(JSON) {
  var temp = [];
  for (var k in JSON) {
    temp.push(k + "=" + encodeURIComponent(JSON[k]));
  }
  return temp.join("&");
}

function findRestData(
  config,
  path,
  backupPathName,
  apiPaths,
  apiList,
  format,
  checkParams,
  _params
) {
  let proxyData = findProxyData(
    backupPathName,
    path,
    config.method,
    checkParams,
    _params
  );
  if (proxyData) {
    // 有备份数据 返回备份数据
    return checkDataSource(proxyData, "backup");
  } else if (!proxyData && apiPaths.length > 0) {
    // 没找到备份数据 去找假数据
    let mockResult = findMockData(config, path, apiPaths, apiList, format);
    if (mockResult) {
      // 有假数据 返回假数据
      return checkDataSource(mockResult, "mock");
    } else {
      // 没有备份数据 也没有假数据
      return false;
    }
  } else {
    // 没有备份数据 也没有假数据
    return false;
  }
}

function findMockData(config, path, apiPaths, apiList, format) {
  let findIndex = null;
  for (let i = 0; i < apiPaths.length; i++) {
    if (apiPaths[i] === path) {
      findIndex = i;
    }
  }
  // 判断path
  if (!findIndex && findIndex !== 0) return false;
  // 判断method
  if (apiList[findIndex].method.toUpperCase() === config.method.toUpperCase()) {
    return checkFormat(apiList[findIndex].data, format);
  } else {
    return false;
  }
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

function checkRequested(path, requestedPaths) {
  console.log(path, requestedPaths);
  if (requestedPaths.indexOf(path) > -1) {
    if (requestedPaths[requestedPaths.indexOf(path)].length === path.length) {
      return true;
    }
    return false;
  }
  return false;
}

function checkDataSource(data, source, isSuccess) {
  if (isSuccess) {
    if (
      Array.isArray(data) ||
      typeof data !== "object" ||
      typeof data === null
    ) {
      try {
        let finalData = JSON.parse(data);
        finalData.source = source;
        finalData._status = "ok";
        return finalData;
      } catch (e) {
        return { source, data, _status: "ok" };
      }
    } else {
      // console.log("B:JSON", data);
      let finalData = data;
      finalData.source = source;
      finalData._status = "ok";
      return finalData;
    }
  } else {
    if (
      Array.isArray(data) ||
      typeof data !== "object" ||
      typeof data === null
    ) {
      try {
        let finalData = JSON.parse(data);
        finalData.source = source;
        return finalData;
      } catch (e) {
        return { source, data };
      }
    } else {
      // console.log("B:JSON", data);
      let finalData = data;
      finalData.source = source;
      return finalData;
    }
  }
}

function checkJSON(data) {
  try {
    return JSON.parse(data);
  } catch (e) {
    return data;
  }
}
module.exports = {
  requestProxyResult,
  requestTimeOutProxyResult,
  requestOnceProxyResult,
  requestTimeOutAllProxyResult
};
