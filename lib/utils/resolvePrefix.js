resolvePrefix = str => {
  if (!str) return;
  switch (str[0]) {
    case ".":
      return str.substring(2, str.length);
    case "/":
      return str.substring(1, str.length);
    default:
      return str;
  }
};

module.exports = resolvePrefix;
