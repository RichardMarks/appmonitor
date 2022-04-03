const state = {
  events: [],
};

const AppMonitorService = {
  POST_EVENT_ENDPOINT: "/event",
  GET_EVENTS_ENDPOINT: "/events",
  create(basePath = "/appmonitor") {
    console.log(`* CREATING AppMonitorService INSTANCE @ ${basePath}`);
    const interceptors = {};
    const service = {
      get basePath() {
        return basePath;
      },
      path(endpoint) {
        return `${basePath}${endpoint}`;
      },
      intercept(endpoint, interceptor) {
        if (!interceptors[endpoint]) {
          interceptors[endpoint] = [];
        }
        interceptors[endpoint].push(interceptor);
      },
      handleEventsClearICP() {
        state.events = [];
      },
      async handlePostEvent(req, res, next) {
        try {
          const { name, message, ...detail } = req.body;
          const recvEvent = {
            time: new Date().getTime(),
            name,
            message,
            detail,
          };
          const listeners =
            interceptors[AppMonitorService.POST_EVENT_ENDPOINT] || [];
          for (const listener of listeners) {
            typeof listener === "function" && listener(recvEvent);
          }
          state.events.push(recvEvent);
          res.status(200).send({ ok: true });
        } catch (err) {
          next(err);
        }
      },
      async handleGetEvents(_, res, next) {
        try {
          res.send({ ok: true, events: state.events.slice() });
        } catch (err) {
          next(err);
        }
      },
    };
    return service;
  },
};

module.exports = { AppMonitorService };
