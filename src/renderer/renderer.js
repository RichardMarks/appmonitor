// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const { AppMonitorBridge: bridge } = window;

if (!bridge) {
  throw new Error("Unable to locate the AppMonitorBridge");
}

function serializeObjToDataString(obj) {
  if (
    typeof obj === "number" ||
    typeof obj === "boolean" ||
    typeof obj === "string"
  ) {
    return obj.toString();
  } else if (Array.isArray(obj)) {
    return obj.map(serializeObjToDataString).join("");
  } else if (typeof obj == "object") {
    return Object.keys(obj)
      .map((key) => `${key}${serializeObjToDataString(obj[key])}`)
      .join("");
  } else if (obj === null) {
    return "null";
  } else if (obj === undefined) {
    return "undefined";
  }
  return "";
}

function createEventListItem(recvEvent) {
  /*
  
  <div class="event-list-item">
    <div class="event-list-item__date">{MM/DD/YYYY HH:mm:SS a}</div>
    <div class="event-list-item__name">Name: {name}</div>
    <div class="event-list-item__message">Message: {message}</div>
    <div class="event-list-item__details">Details: {details}</div>
  </div>
  */

  const item = document.createElement("div");
  item.classList.add("event-list-item");

  const dateDiv = document.createElement("div");
  dateDiv.classList.add("event-list-item__date");

  const nameDiv = document.createElement("div");
  nameDiv.classList.add("event-list-item__name");

  const messageDiv = document.createElement("div");
  messageDiv.classList.add("event-list-item__message");

  const detailDiv = document.createElement("div");
  detailDiv.classList.add("event-list-item__details");

  const event = JSON.parse(recvEvent);
  const { time, name, message, detail } = event;

  const date = new Date(time);

  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  let hour = date.getHours();

  const minute = date.getMinutes();
  const second = date.getSeconds();

  const pad = (n) => n.toString().padStart(2, "0");

  const am = hour < 12 ? "am" : "pm";

  hour = hour > 12 ? hour - 12 : hour;

  const dateStr = `${year}/${pad(month)}/${pad(day)}`;
  const timeStr = `${pad(hour)}:${pad(minute)}:${pad(second)} ${am}`;
  const dateDivContent = `${dateStr} ${timeStr}`;
  const nameDivContent = `Name: ${name}`;
  const messageDivContent = `Message: ${message}`;
  const detailDivContent = `Details: ${JSON.stringify(detail)}`;

  dateDiv.appendChild(document.createTextNode(dateDivContent));
  nameDiv.appendChild(document.createTextNode(nameDivContent));
  messageDiv.appendChild(document.createTextNode(messageDivContent));
  detailDiv.appendChild(document.createTextNode(detailDivContent));

  item.appendChild(dateDiv);
  item.appendChild(nameDiv);
  item.appendChild(messageDiv);
  item.appendChild(detailDiv);

  item.dataset.name = name;
  item.dataset.message = message;
  item.dataset.details = serializeObjToDataString(detail);

  return item;
}

function eventListItemMatchesFilter(item, { key = "name", value: text = "" }) {
  return (
    text === "" ||
    (item && item.dataset[key] && item.dataset[key].includes(text))
  );
}

function filterEvents(list, filter) {
  const text = filter.value || "";
  const key = filter.key || "name";

  if (text.length) {
    for (const item of list.children) {
      item.style.display = eventListItemMatchesFilter(item, filter)
        ? "initial"
        : "none";
    }
  } else {
    for (const item of list.children) {
      item.style.display = "initial";
    }
  }
}

function connectEvents() {
  const btnStartServer = document.querySelector(".btn-start-server");
  const btnStopServer = document.querySelector(".btn-stop-server");
  const btnClearEvents = document.querySelector(".btn-clear-events");
  const txtServerPort = document.querySelector(".input-server-port");
  const btnFilterEvents = document.querySelector(".btn-filter-events");
  const txtFilterText = document.querySelector(".input-filter-text");
  const btnClearFilter = document.querySelector(".btn-clear-filter");
  const selectFilterKey = document.querySelector(".select-filter-key");

  const divEventsReceivedList = document.querySelector(
    ".events-received .event-list"
  );

  function filterEventsReceivedList() {
    filterEvents(divEventsReceivedList, {
      value: txtFilterText.value,
      key: selectFilterKey.value,
    });
  }

  function addEventsReceivedListItem(recvEvent) {
    const item = createEventListItem(recvEvent);
    const filter = { key: selectFilterKey.value, value: txtFilterText.value };
    item.style.display = eventListItemMatchesFilter(item, filter)
      ? "initial"
      : "none";
    divEventsReceivedList.appendChild(item);
  }

  btnFilterEvents.disabled = true;
  btnClearEvents.disabled = true;

  // initially the filter text and clear filter buttons are not displayed
  txtFilterText.style.display = "none";
  btnClearFilter.style.display = "none";
  selectFilterKey.style.display = "none";

  // clicking the filter events button
  // - will show the filter text input
  // - will show the clear filter button
  // - will hide the filter events button
  btnFilterEvents.addEventListener(
    "click",
    () => {
      txtFilterText.style.display = "initial";
      btnClearFilter.style.display = "initial";
      selectFilterKey.style.display = "initial";
      btnFilterEvents.style.display = "none";
    },
    false
  );

  // clicking the clear filter button
  // - if the filter text input is empty
  //     - will hide the filter text input
  //     - will hide the clear filter button
  //     - will show the filter events button
  // - if the filter text input is not empty
  //     - will clear the filter text input
  //     - will update displayed received events list to show all events
  btnClearFilter.addEventListener(
    "click",
    () => {
      if (!txtFilterText.value.length) {
        txtFilterText.style.display = "none";
        btnClearFilter.style.display = "none";
        selectFilterKey.style.display = "none";
        btnFilterEvents.style.display = "initial";
        // TODO - update displayed received events list to show all events (unfiltered)
      } else {
        txtFilterText.value = "";
        // TODO - update displayed received events list to show all events (unfiltered)
      }
      filterEventsReceivedList();
    },
    false
  );

  // changing the filter text input value
  // - will update displayed received events list to show events matching the filter
  txtFilterText.addEventListener(
    "input",
    (e) => {
      const text = e.target.value;
      // TODO - update displayed received events list to show events matching the filter
      console.log("TODO - filter events matching", text);
      filterEventsReceivedList();
    },
    false
  );

  selectFilterKey.addEventListener(
    "input",
    () => {
      console.log("select", selectFilterKey.value);
      filterEventsReceivedList();
    },
    false
  );

  btnClearEvents.addEventListener(
    "click",
    () => {
      // clear the events list in the UI
      while (divEventsReceivedList.firstChild) {
        divEventsReceivedList.removeChild(divEventsReceivedList.firstChild);
      }
      // cannot filter an empty list
      btnFilterEvents.disabled = true;
      // cannot clear an empty list
      btnClearEvents.disabled = true;
      // tell the backend to clear the events
      bridge.clearEvents();
    },
    false
  );

  bridge.onEventReceived((_, recvEvent) => {
    console.log("* RECEIVED EVENT");
    console.log({ recvEvent });
    addEventsReceivedListItem(recvEvent);
    btnFilterEvents.disabled = false;
    btnClearEvents.disabled = false;
  });

  btnStopServer.disabled = true;

  btnStartServer.addEventListener(
    "click",
    async () => {
      btnStartServer.setAttribute("disabled", "disabled");
      const result = await bridge.startServer(~~txtServerPort.value);
      console.log({ result });
      if (result) {
        btnStopServer.disabled = false;
        txtServerPort.disabled = true;
      } else {
        alert(
          "Server could not be started. Port in use already? Try another port."
        );
        btnStartServer.disabled = false;
      }
    },
    false
  );

  btnStopServer.addEventListener(
    "click",
    async () => {
      btnStopServer.disabled = true;
      const result = await bridge.stopServer();
      console.log({ result });
      if (result) {
        btnStartServer.disabled = false;
        txtServerPort.disabled = false;
      } else {
        alert(
          "Could not stop server! Quit the application and the server should stop"
        );
        btnStopServer.disabled = false;
      }
    },
    false
  );
}

connectEvents();
