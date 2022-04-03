const path = require("path");

const BRIDGE_PRELOAD = path.resolve("src", "bridge", "appmonitorpreload.js");
const RENDERER_INDEX = path.resolve("src", "renderer", "index.html");

module.exports = {
  BRIDGE_PRELOAD,
  RENDERER_INDEX,
};
