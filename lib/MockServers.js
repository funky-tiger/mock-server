const path = require("path");
const fs = require("fs");
const express = require("express");
const request = require("request");
const chalk = require("chalk");
const saveProxyData = require("./utils/saveProxyData.js");
const findProxyData = require("./utils/findProxyData.js");
const { router } = require("./router.js");
const cleanCache = require("../lib/utils/cleanCache.js");

let app;
let requestTimer;
class MockServers {
  constructor(config) {
    this.config = config;
    this.mockData = config.mockData;
    this.format = config.mockData.format || null;
    this.apiList = config.mockData.apiList || null;
    this.apiPaths = [];
    this.backupPathName = "mockservers-backup";
    this.requestedPaths = [];
    this.mode = config.mode;
    this.port = config.mockServer.port;
    this.proxy = config.mockServer.proxy;
    this.timeout = config.mockServer.timeout;
    this.path = null;
    this.entry = config.entry;
    this.entryId = "";
    this.modules = {};
    this.rootPath = process.cwd();
  }
  run(backupPath) {
    // 解析mock数据的api路径path
    this.resolveApiPaths();
    if (backupPath) this.checkBackupPath(backupPath);
    this.emit();
  }
  checkBackupPath(path) {
    if (path.indexOf("/") > -1) {
      let index = path.indexOf("/");
      path = path.substring(0, index);
      this.backupPathName = path;
    } else {
      // 文件
      console.log("文件");
    }
  }
  resolveApiPaths() {
    if (
      !this.apiList ||
      !Array.isArray(this.apiList) ||
      this.apiList.length === 0
    ) {
      return;
    } else {
      let apipaths = [];
      for (let i = 0; i < this.apiList.length; i++) {
        apipaths.push(this.checkPath(this.apiList[i].path));
      }
      this.apiPaths = apipaths;
    }
  }
  checkProxy(proxyUrl) {
    if (proxyUrl[proxyUrl.length - 1] === "/") {
      // 处理proxy地址末尾带有多余/的情况
      let fixedUrl = proxyUrl.substring(0, proxyUrl.length - 1);
      return fixedUrl;
    } else {
      return proxyUrl;
    }
  }
  requestProxyResult(url, config) {
    return new Promise((resolve, reject) => {
      request(
        {
          url: url,
          method: config.method,
          json: true,
          headers: config.headers,
          body: config
        },
        (error, response, body) => {
          if (error) {
            resolve(this.checkDataSource(error, "api"));
          }
          resolve(this.checkDataSource(response.body, "api"));
        }
      );
    });
  }
  requestTimeOutAllProxyResult(url, config) {
    return new Promise((resolve, reject) => {
      if (!this.timeout && this.timeout !== 0) {
        resolve({
          error: 1,
          source: null,
          message: `Please appoint mock-server's timeout`
        });
      }
      requestTimer = setTimeout(() => {
        let restResult = this.findRestData(config);
        if (!restResult) {
          resolve({
            error: 1,
            source: null,
            message: "timeout over! Not Found Any Data."
          });
        }
        resolve(restResult);
      }, this.timeout);
      request(
        {
          url: url,
          method: config.method,
          json: true,
          headers: config.headers,
          body: config
        },
        (error, response, body) => {
          if (error) {
            resolve(this.checkDataSource(error, "api"));
          }
          if (requestTimer) clearTimeout(requestTimer);
          if (
            response &&
            response.statusCode &&
            response.statusCode >= 200 &&
            response.statusCode < 400
          ) {
            saveProxyData(this.backupPathName, this.path, response.body);
            resolve(this.checkDataSource(response.body, "api"));
          } else {
            // 请求失败 查找剩余数据: 备份数据 / 假数据
            let restResult = this.findRestData(config);
            if (!restResult) {
              resolve({
                error: 1,
                code: response.statusCode || 404,
                message: `404 Not Found`,
                source: "api"
              });
            }
            resolve(restResult);
          }
        }
      );
    });
  }
  checkRequested(path) {
    if (this.requestedPaths.indexOf(path) > -1) {
      if (
        this.requestedPaths[this.requestedPaths.indexOf(path)].length ===
        this.path.length
      ) {
        return true;
      }
      return false;
    }
    return false;
  }
  requestTimeOutProxyResult(url, config) {
    return new Promise((resolve, reject) => {
      if (!this.timeout && this.timeout !== 0) {
        resolve({
          error: 1,
          source: null,
          message: `Please appoint mock-server's timeout`
        });
      }
      if (this.checkRequested(this.path)) {
        requestTimer = setTimeout(() => {
          let restResult = this.findRestData(config);
          if (!restResult) {
            resolve({
              error: 1,
              source: null,
              message: "timeout over! Not Found Any Data."
            });
          }
          resolve(restResult);
          return;
        }, this.timeout);
      }

      request(
        {
          url: url,
          method: config.method,
          json: true,
          headers: config.headers,
          body: config
        },
        (error, response, body) => {
          if (error) {
            resolve(this.checkDataSource(error, "api"));
          }
          if (requestTimer) clearTimeout(requestTimer);
          if (
            response &&
            response.statusCode &&
            response.statusCode >= 200 &&
            response.statusCode < 400
          ) {
            saveProxyData(this.backupPathName, this.path, response.body);
            this.requestedPaths.push(this.path);
            console.log("this.path:::", this.path);
            resolve(this.checkDataSource(response.body, "api"));
          } else {
            // 请求失败 查找剩余数据: 备份数据 / 假数据
            let restResult = this.findRestData(config);
            if (!restResult) {
              resolve({
                error: 1,
                code: response.statusCode || 404,
                source: "api",
                message: `404 Not Found`
              });
            }
            resolve(restResult);
          }
        }
      );
    });
  }
  requestOnceProxyResult(url, config) {
    return new Promise((resolve, reject) => {
      let proxyData = findProxyData(this.backupPathName, this.path);
      if (!proxyData) {
        // 首次请求
        request(
          {
            url: url,
            method: config.method,
            json: true,
            headers: config.headers,
            body: config
          },
          (error, response, body) => {
            if (error) {
              resolve(this.checkDataSource(error, "api"));
            }
            if (
              response &&
              response.statusCode &&
              response.statusCode >= 200 &&
              response.statusCode < 400
            ) {
              saveProxyData(this.backupPathName, this.path, response.body);
              resolve(this.checkDataSource(response.body, "api"));
            } else {
              resolve({
                error: 1,
                code: response.statusCode || 404,
                source: "api",
                message: `404 Not Found`
              });
            }
          }
        );
      } else {
        resolve(this.checkDataSource(proxyData, "mock"));
      }
    });
  }
  emit() {
    cleanCache(require.resolve("./router.js"));
    app = express();
    app.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Methods",
        "PUT, GET, POST, DELETE, OPTIONS"
      );
      res.header("Access-Control-Allow-Headers", "X-Requested-With");
      res.header("Access-Control-Allow-Headers", "Content-Type");
      next();
    });
    app.use(function(req, res, next) {
      router(req, res, next);
    });
    /** 获取前端请求路径， 进行接口转发 */
    app.use(async (req, res, next) => {
      this.path = req.path;
      let proxyConfig = {};
      proxyConfig.method = req.method;
      proxyConfig.body = req.query;
      proxyConfig.headers = req.headers;
      let proxyUrl = this.checkProxy(this.proxy);
      let resultUrl = proxyUrl + req.path;
      let mockResponse = null;
      let proxyResponse = null;
      switch (this.mode) {
        case "just-mock":
          console.log("走了0");
          // mockResponse = this.resolveMockApiList(this.apiList);
          if (mockResponse) {
            res.send(mockResponse);
          }
          next();
          break;
        case "request":
          console.log("走了1");
          proxyResponse = await this.requestProxyResult(resultUrl, proxyConfig);
          res.send(proxyResponse);
          break;
        case "request-timeout-all":
          console.log("走了2");
          proxyResponse = await this.requestTimeOutAllProxyResult(
            resultUrl,
            proxyConfig
          );
          res.send(proxyResponse);
          break;
        case "request-timeout":
          console.log("走了3");
          proxyResponse = await this.requestTimeOutProxyResult(
            resultUrl,
            proxyConfig
          );
          res.send(proxyResponse);
          break;
        case "request-once":
          console.log("走了4");
          proxyResponse = await this.requestOnceProxyResult(
            resultUrl,
            proxyConfig
          );
          res.send(proxyResponse);
          break;
        default:
          res.send({
            error: 1,
            source: null,
            message: `Please appoint mock-server's mode`
          });
      }
    });
    try {
      app.listen(this.port, () => {
        console.log(
          chalk.green.bold(
            `🐯  MockServers is Running on Port: ${this.port}.   `
          )
        );
      });
    } catch (e) {
      console.log(">>>>>>>>>", e);
    }
  }

  resolveMockApiList(apilist) {
    let apiList = apilist;
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
          app.get(this.checkPath(item.path), (req, res) => {
            res.send(this.checkFormat(item.data));
          });
          break;
        case "POST":
          app.post(this.checkPath(item.path), (req, res) => {
            res.send(this.checkFormat(item.data));
          });
          break;
        default:
          app.get(this.checkPath(item.path), (req, res) => {
            res.send(this.checkFormat(item.data));
          });
          return;
      }
    });
  }
  checkPath(path) {
    // fix: 请求路径首位 /
    return path[0] !== "/" ? "/" + path : path;
  }
  checkFormat(data) {
    // fix: 返回数据嵌套format
    if (JSON.stringify(this.format) == "{}" || !this.format) {
      return this.checkDataSource(data, "mock");
    } else {
      let formatCopy = this.format;
      formatCopy.data = data;
      formatCopy.source = "mock";
      return formatCopy;
    }
  }

  // 添加数据涞源source
  checkDataSource(data, source) {
    if (
      Array.isArray(data) ||
      typeof data !== "object" ||
      typeof data === null
    ) {
      // console.log("A:数组 / 常量 / null");
      return { source, data };
    } else {
      // console.log("B:JSON", data);
      let finalData = data;
      finalData.source = source;
      return finalData;
    }
  }

  // 查找剩余数据: 备份数据 / 假数据
  findRestData(config) {
    let proxyData = findProxyData(this.backupPathName, this.path);
    if (proxyData) {
      // 有备份数据 返回备份数据
      return this.checkDataSource(proxyData, "backup");
    } else if (!proxyData && this.apiPaths.length > 0) {
      // 没找到备份数据 去找假数据
      let mockResult = this.findMockData(config);
      if (mockResult) {
        // 有假数据 返回假数据
        return this.checkDataSource(mockResult, "mock");
      } else {
        // 没有备份数据 也没有假数据
        return false;
      }
    } else {
      // 没有备份数据 也没有假数据
      return false;
    }
  }

  // 查找假数据
  findMockData(config) {
    let findIndex = null;
    for (let i = 0; i < this.apiPaths.length; i++) {
      if (this.apiPaths[i] === this.path) {
        findIndex = i;
      }
    }
    // 判断path
    if (!findIndex && findIndex !== 0) return false;
    // 判断method
    if (
      this.apiList[findIndex].method.toUpperCase() ===
      config.method.toUpperCase()
    ) {
      return this.checkFormat(this.apiList[findIndex].data);
    } else {
      return false;
    }
  }
}

module.exports = MockServers;
