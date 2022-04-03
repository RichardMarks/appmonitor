const { BrowserWindow } = require("electron");
const { BRIDGE_PRELOAD, RENDERER_INDEX } = require("../config");

function getMainWindowWebPreferences() {
  const prefs = {
    preload: BRIDGE_PRELOAD,
  };
  return prefs;
}

const state = {
  window: null,
};

const AppMonitorWindow = {
  create() {
    const amw = {
      get window() {
        return state.window;
      },
      async create(width = 800, height = 600) {
        const webPreferences = getMainWindowWebPreferences();
        const options = {
          width,
          height,
          webPreferences,
        };
        state.window = new BrowserWindow(options);
      },
      async load(htmlFile = RENDERER_INDEX) {
        await state.window.loadFile(htmlFile);
      },
    };
    return amw;
  },
};

module.exports = { AppMonitorWindow };
