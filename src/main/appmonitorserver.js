const express = require("express");

const AppMonitorServer = {
  create() {
    console.log("* CREATING AppMonitorServer INSTANCE");
    const app = express();

    app.use(express.json());

    const state = {
      started: false,
    };

    let server;

    const ams = {
      start(port) {
        return new Promise((resolve, reject) => {
          if (state.started) {
            return reject(new Error("Already Started"));
          }
          console.log(app._router);
          server = app
            .listen(port, () => {
              console.log(`* SERVER STARTED ON PORT ${port}`);
              state.started = true;
              resolve(port);
            })
            .on("error", (err) => {
              console.log(`* FAILED TO START SERVER ON PORT ${port}\n${err}`);
              reject(err);
            });
        });
      },
      get(path, handler) {
        app.get(path, handler);
        return ams;
      },
      post(path, handler) {
        app.post(path, handler);
        return ams;
      },
      stop(isKill) {
        if (!server) {
          return Promise.resolve();
        }
        return new Promise((resolve, reject) => {
          if (!isKill && !state.started) {
            return reject(new Error("Already Stopped"));
          }
          server
            .on("error", (err) => {
              console.log(`* FAILED TO STOP SERVER\n${err}`);
              reject(err);
            })
            .close(() => {
              console.log("* SERVER STOPPED");
              state.started = false;
              resolve();
            });
        });
      },
    };
    return ams;
  },
};

module.exports = { AppMonitorServer };
