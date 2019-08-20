const path = require("path");

module.exports = function cleanCache(modulePath) {
  // 热更新之前操作 清除cache
  Object.keys(require.cache).forEach(function(cachePath) {
    if (cachePath.startsWith(path.resolve(process.cwd()))) {
      delete require.cache[cachePath];
    }
  });
};
