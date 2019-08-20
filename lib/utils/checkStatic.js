/*
 * @LastEditors: Tiger
 * @Description: In User Settings Edit
 * @Author: Tiger
 * @Date: 2019-08-20 17:23:26
 * @LastEditTime: 2019-08-20 17:30:10
 */

const prefixArr = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".mp3", ".mp4"];

module.exports = function checkStatic(path) {
  let _arr = path.split(".");
  let _prefix = _arr[_arr.length - 1];
  if (prefixArr.indexOf("." + _prefix) !== -1) {
    return _prefix;
    console.log("静态资源", _prefix);
  } else {
    return false;
    console.log("接口数据", _prefix);
  }
};
