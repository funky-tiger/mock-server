fixUrlPar = obj => {
  let keys = Object.keys(obj);
  let vals = Object.values(obj);
  let arr = [];
  for (let i = 0; i < keys.length; i++) {
    let _str = keys[i] + "=" + vals[i];
    arr.push(_str);
  }
  return arr.join("&");
};

module.exports = fixUrlPar;
