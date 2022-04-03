const path = require("path");
const { ipcMain, BrowserWindow } = require("electron");
const { AppMonitorServer } = require("./appmonitorserver");
const { AppMonitorService } = require("./appmonitorservice");
const { AppMonitorSignals } = require("../shared/appmonitorsignals");
const { AppMonitorWindow } = require("./appmonitorwindow");

const window = AppMonitorWindow.create();
const server = AppMonitorServer.create();
const service = AppMonitorService.create();

async function handleStartServer(event, serverPort) {
  console.log(`* RECV START SERVER ON PORT: ${serverPort}`);
  try {
    await server.start(serverPort);
    return true;
  } catch (err) {
    console.error(err.message);
    return false;
  }
}

async function handleStopServer(event) {
  console.log(`* RECV STOP SERVER`);
  try {
    await server.stop();
    return true;
  } catch (err) {
    console.error(err.message);
    return false;
  }
}

async function handleClearEvents(event) {
  console.log(`* RECV CLEAR EVENTS`);
  service.handleEventsClearICP();
}

async function handleRecvPostEvent(recvEvent) {
  console.log(`* RECV EVENT:\n${JSON.stringify(recvEvent, null, 2)}`);
  window.window.webContents.send(
    AppMonitorSignals.Recv,
    JSON.stringify(recvEvent)
  );
}

async function createMainWindow() {
  await window.create(1280, 600);
  await window.load();
}

async function setupServer() {
  service.intercept(AppMonitorService.POST_EVENT_ENDPOINT, handleRecvPostEvent);
  server.post(
    service.path(AppMonitorService.POST_EVENT_ENDPOINT),
    service.handlePostEvent
  );
  server.get(
    service.path(AppMonitorService.GET_EVENTS_ENDPOINT),
    service.handleGetEvents
  );
}

async function connectIPC() {
  console.log("* CONNECTING IPC in AppMonitorMain");

  ipcMain.handle(AppMonitorSignals.StartServer, handleStartServer);
  ipcMain.handle(AppMonitorSignals.StopServer, handleStopServer);
  ipcMain.on(AppMonitorSignals.ClearEvents, handleClearEvents);
}

const AppMonitorMain = {
  backend: {
    server,
    service,
  },

  async start(app) {
    // Quit when all windows are closed, except on macOS. There, it's common
    // for applications and their menu bar to stay active until the user quits
    // explicitly with Cmd + Q.
    app.on("window-all-closed", async () => {
      if (process.platform !== "darwin") {
        app.quit();
      }
    });

    // Stop the express server when quitting the application
    app.on("will-quit", async () => {
      console.log("* KILLING AppMonitorMain");
      await server.stop(true);
    });

    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    app.on("activate", async () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        await createMainWindow();
      }
    });

    await createMainWindow();
    await setupServer();
    await connectIPC();

    window.window.webContents.openDevTools();
  },
};

module.exports = { AppMonitorMain };
