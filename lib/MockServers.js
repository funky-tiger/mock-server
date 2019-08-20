/*
 * @LastEditors: Tiger
 * @Description: In User Settings Edit
 * @Author: Tiger
 * @Date: 1985-10-26 16:15:00
 * @LastEditTime: 2019-08-20 19:12:40
 */
const path = require("path");
const fs = require("fs");
const express = require("express");
const request = require("request");
const chalk = require("chalk");
const mime = require("mime");
const {
  requestProxyResult,
  requestTimeOutProxyResult,
  requestOnceProxyResult,
  requestTimeOutAllProxyResult
} = require("./utils/request.js");
const checkStatic = require("./utils/checkStatic.js");
const saveProxyFile = require("./utils/saveProxyFile.js");
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
    this.format =
      config.mockData && config.mockData.format ? config.mockData.format : null;
    this.apiList =
      config.mockData && config.mockData.apiList
        ? config.mockData.apiList
        : null;
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

  emit() {
    cleanCache(require.resolve("./router.js"));
    app = express();
    // app.use(function(req, res, next) {
    //   res.header("Access-Control-Allow-Origin", "*");
    //   res.header(
    //     "Access-Control-Allow-Methods",
    //     "PUT, GET, POST, DELETE, OPTIONS"
    //   );
    //   res.header("Access-Control-Allow-Headers", "X-Requested-With");
    //   res.header("Access-Control-Allow-Headers", "Content-Type");
    //   next();
    // });
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
      let isStatic = checkStatic(req.path);

      switch (this.mode) {
        case "just-mock":
          if (mockResponse) {
            res.send(mockResponse);
          }
          next();
          break;
        case "request":
          if (isStatic) {
            let isNeedFind = await saveProxyFile(
              this.backupPathName,
              req.path,
              this.config.mockServer.proxy
            );
            this.resolveStatic(isNeedFind, req, res);
          } else {
            proxyResponse = await requestProxyResult(resultUrl, proxyConfig);
            res.send(proxyResponse);
          }
          break;
        case "request-timeout-all":
          if (isStatic) {
            let isNeedFind = await saveProxyFile(
              this.backupPathName,
              req.path,
              this.config.mockServer.proxy
            );
            this.resolveStatic(isNeedFind, req, res);
          } else {
            proxyResponse = await requestTimeOutAllProxyResult(
              req.path,
              resultUrl,
              proxyConfig,
              this.timeout,
              this.backupPathName,
              this.apiPaths,
              this.apiList,
              this.format
            );
            res.send(proxyResponse);
          }

          break;
        case "request-timeout":
          if (isStatic) {
            let isNeedFind = await saveProxyFile(
              this.backupPathName,
              req.path,
              this.config.mockServer.proxy
            );
            this.resolveStatic(isNeedFind, req, res);
          } else {
            proxyResponse = await requestTimeOutProxyResult(
              req.path,
              resultUrl,
              proxyConfig,
              this.timeout,
              this.backupPathName,
              this.requestedPaths,
              this.apiPaths,
              this.apiList,
              this.format
            );
            // 首次请求成功标识位
            if (proxyResponse._status && proxyResponse._status === "ok") {
              this.requestedPaths.push(req.path);
            }
            res.send(proxyResponse);
          }
          break;
        case "request-once":
          if (isStatic) {
            let isNeedFind = await saveProxyFile(
              this.backupPathName,
              req.path,
              this.config.mockServer.proxy
            );
            this.resolveStatic(isNeedFind, req, res);
          } else {
            proxyResponse = await requestOnceProxyResult(
              req.path,
              resultUrl,
              proxyConfig,
              this.backupPathName,
              this.config.mockServer.proxy
            );
            res.send(proxyResponse);
          }
          break;
        default:
          if (mockResponse) {
            res.send(mockResponse);
          }
          next();
          break;
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

  checkPath(path) {
    // fix: 请求路径首位斜杆
    return path[0] !== "/" ? "/" + path : path;
  }

  resolveStatic(isNeedFind, req, res) {
    if (typeof isNeedFind === "string") {
      console.log("读取静态资源操作...");
      res.writeHead(200, { "Content-Type": mime.getType(isNeedFind) });
      fs.createReadStream(isNeedFind)
        .pipe(res)
        .on("end", function() {
          res.end();
          console.log("end call");
        });
    } else {
      // 首次请求到该静态资源
      request
        .get({
          url: isNeedFind._url,
          json: req.body,
          gzip: true,
          headers: {
            "Content-Type": "application/octet-stream"
          }
        })
        .on("response", function(response) {
          response.pipe(res);
        });
    }
  }
}

module.exports = MockServers;
