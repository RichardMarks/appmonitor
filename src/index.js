const { app } = require("electron");
const { AppMonitorMain } = require("./main/appmonitormain");

async function main() {
  await app.whenReady();
  AppMonitorMain.start(app);
}

main().catch((err) => {
  console.log("* WE HAVE A PROBLEM");
  console.error(err.message);
});
