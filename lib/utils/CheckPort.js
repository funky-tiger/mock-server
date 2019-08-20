const net = require("net");

function checkPort(port) {
  let isUsed = 0;
  const server = net.createServer().listen(port);
  return new Promise((resolve, reject) => {
    server.on("listening", () => {
      // console.log(`the server is runnint on port ${port}`);
      server.close();
      resolve(port);
    });

    server.on("error", err => {
      if (err.code === "EADDRINUSE") {
        resolve(false);
        // console.log(`this port ${port} is occupied.try another.`);
      } else {
        reject(err);
      }
    });
  });
}

module.exports = checkPort;
