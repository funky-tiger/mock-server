const net = require("net");

function checkPort(port) {
  let isUsed = 0;
  const server = net.createServer().listen(port);
  return new Promise((resolve, reject) => {
    server.on("listening", () => {
      server.close();
      resolve(port);
    });

    server.on("error", err => {
      if (err.code === "EADDRINUSE") {
        resolve(false);
      } else {
        reject(err);
      }
    });
  });
}

module.exports = checkPort;
