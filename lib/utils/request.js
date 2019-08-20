/*
 * @LastEditors: Tiger
 * @Description: In User Settings Edit
 * @Author: Tiger
 * @Date: 1985-10-26 16:15:00
 * @LastEditTime: 2019-08-20 18:49:32
 */
const request = require("request");
const saveProxyData = require("../utils/saveProxyData.js");
const findProxyData = require("../utils/findProxyData.js");
const saveProxyFile = require("../utils/saveProxyFile.js");
const prefixArr = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".mp3", ".mp4"];

function requestProxyResult(url, config) {
  return new Promise((resolve, reject) => {
    let options =
      config.method === "POST"
        ? {
            url: url, //请求路径
            method: "POST", //请求方式，默认为get
            headers: {
              //设置请求头
              "content-type": "application/json"
            },
            body: JSON.stringify(config.body)
          }
        : {
            url: url + "?" + changeJSON2QueryString(config.body), //请求路径
            method: "GET", //请求方式，默认为get
            headers: {
              //设置请求头
              "content-type": "application/json"
            }
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
  format
) {
  let requestTimer = null;
  return new Promise((resolve, reject) => {
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
        format
      );
      if (!restResult) {
        resolve({
          error: 1,
          source: null,
          message: "timeout over! Not Found Any Data."
        });
      }
      resolve(restResult);
    }, timeout);
    let options =
      config.method === "POST"
        ? {
            url: url, //请求路径
            method: "POST", //请求方式，默认为get
            headers: {
              //设置请求头
              "content-type": "application/json"
            },
            body: JSON.stringify(config.body)
          }
        : {
            url: url + "?" + changeJSON2QueryString(config.body), //请求路径
            method: "GET", //请求方式，默认为get
            headers: {
              //设置请求头
              "content-type": "application/json"
            }
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
          config.method
        );
        resolve(checkDataSource(checkJSON(response.body), "api", true));
      } else {
        // 请求失败 查找剩余数据: 备份数据 / 假数据
        let restResult = findRestData(
          config,
          path,
          backupPathName,
          apiPaths,
          apiList,
          format
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
  proxy,
  res
) {
  let isStatic = checkFileType(reqpath);
  // if (isStatic) {
  //   let isNeedFind = await saveProxyFile(backupPathName, reqpath, proxy);
  //   console.log("是否已经备份过该静态资源", isNeedFind);
  // } else {
  return new Promise((resolve, reject) => {
    let proxyData = findProxyData(backupPathName, reqpath, config.method);
    if (!proxyData) {
      let options =
        config.method === "POST"
          ? {
              url: url,
              method: "POST",
              headers: {
                // ...config.headers,
                "content-type": "application/json"
              },
              body: JSON.stringify(config.body)
            }
          : {
              url: url + "?" + changeJSON2QueryString(config.body),
              method: "GET",
              headers: {
                // ...config.headers,
                "content-type": "application/json"
              }
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
          saveProxyData(
            backupPathName,
            reqpath,
            checkJSON(response.body),
            config.method
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
      resolve(checkDataSource(proxyData, "mock"));
    }
  });
  // }
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
  format
) {
  let requestTimer = null;

  return new Promise((resolve, reject) => {
    if (!timeout && timeout !== 0) {
      resolve({
        error: 1,
        source: null,
        message: `Error: Please appoint mock-server's timeout`
      });
    }
    if (checkRequested(reqpath, requestedPaths)) {
      requestTimer = setTimeout(() => {
        let restResult = findRestData(
          config,
          reqpath,
          backupPathName,
          apiPaths,
          apiList,
          format
        );
        if (!restResult) {
          resolve({
            error: 1,
            source: null,
            message: "Error: timeout over! Not Found Any Data."
          });
        }
        resolve(restResult);
        return;
      }, timeout);
    }
    let options =
      config.method === "POST"
        ? {
            url: url, //请求路径
            method: "POST", //请求方式，默认为get
            headers: {
              //设置请求头
              "content-type": "application/json"
            },
            body: JSON.stringify(config.body)
          }
        : {
            url: url + "?" + changeJSON2QueryString(config.body), //请求路径
            method: "GET", //请求方式，默认为get
            headers: {
              //设置请求头
              "content-type": "application/json"
            }
          };
    request(options, (error, response, body) => {
      // if (reqpath === "/api/system/version/config") {
      //   console.log(error, response, body);
      // }
      // console.log("response:>>>", response);
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
          config.method
        );
        resolve(checkDataSource(checkJSON(response.body), "api", true));
      } else {
        // 请求失败 查找剩余数据: 备份数据 / 假数据
        let restResult = findRestData(
          config,
          reqpath,
          backupPathName,
          apiPaths,
          apiList
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

function checkFileType(path) {
  let _arr = path.split(".");
  let _prefix = _arr[_arr.length - 1];
  if (prefixArr.indexOf("." + _prefix) !== -1) {
    return _prefix;
    console.log("静态资源", _prefix);
  } else {
    return false;
    console.log("接口数据", _prefix);
  }
}

function findRestData(config, path, backupPathName, apiPaths, apiList, format) {
  let proxyData = findProxyData(backupPathName, path, config.method);
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
