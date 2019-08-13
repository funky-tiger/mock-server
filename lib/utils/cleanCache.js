const path = require("path");

module.exports = function cleanCache(modulePath) {
  // 热更新之前操作 清除cache
  Object.keys(require.cache).forEach(function(cachePath) {
    if (cachePath.startsWith(path.resolve(process.cwd()))) {
      delete require.cache[cachePath];
    }
  });
};

// module.exports = function cleanCache(modulePath) {
//   var module = require.cache[modulePath];
//   // remove reference in module.parent
//   if (module.parent) {
//     module.parent.children.splice(module.parent.children.indexOf(module), 1);
//   }
//   require.cache[modulePath] = null;
// };
