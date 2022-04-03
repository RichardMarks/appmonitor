const { contextBridge, ipcRenderer } = require("electron");
const { AppMonitorSignals } = require("../shared/appmonitorsignals");

const AppMonitorBridge = {
  KEY: "AppMonitorBridge",
  publicAPI: {
    async startServer(serverPort) {
      const result = await ipcRenderer.invoke(
        AppMonitorSignals.StartServer,
        serverPort
      );
      return result;
    },
    async stopServer() {
      const result = await ipcRenderer.invoke(AppMonitorSignals.StopServer);
      return result;
    },
    clearEvents() {
      ipcRenderer.send(AppMonitorSignals.ClearEvents);
    },
    onEventReceived(cb) {
      ipcRenderer.on(AppMonitorSignals.Recv, cb);
    },
  },
  expose() {
    console.log("* EXPOSING API TO CONTEXT BRIDGE");
    contextBridge.exposeInMainWorld(
      AppMonitorBridge.KEY,
      AppMonitorBridge.publicAPI
    );
  },
};

module.exports = { AppMonitorBridge };
