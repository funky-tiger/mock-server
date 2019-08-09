resolveConfig = name => {
  let argvStr = process.argv.join("");
  var configReg = null;
  switch (name) {
    case "path":
      configReg = /(?<=--path).*?(?=--)/;
      break;
    default:
      return;
  }

  let configReslut = argvStr.match(configReg);
  if (!configReslut) {
    // 没有配置path 或者 配置的path在最后一项
    if (getCaption(argvStr, name)) {
      // 确定配置的path在最后一项
      let beforeResoveConfigStr = getCaption(argvStr, name);
      let resoveConfigStr = beforeResoveConfigStr.substring(
        name.length,
        beforeResoveConfigStr.length
      );
      return resoveConfigStr;
    } else {
      return;
    }
  } else {
    return configReslut[0];
  }
};

getCaption = (configStr, type) => {
  let index = configStr.indexOf(`--${type}`);
  configStr = configStr.substring(index + 2, configStr.length);
  return index > -1 ? configStr : false;
};

module.exports = resolveConfig;
