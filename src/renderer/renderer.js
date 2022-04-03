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

  return item;
}

function connectEvents() {
  const btnStartServer = document.querySelector(".btn-start-server");
  const btnStopServer = document.querySelector(".btn-stop-server");
  const btnClearEvents = document.querySelector(".btn-clear-events");
  const txtServerPort = document.querySelector(".input-server-port");

  const divEventsReceivedList = document.querySelector(
    ".events-received .event-list"
  );

  btnClearEvents.addEventListener(
    "click",
    () => {
      // clear the events list in the UI
      while (divEventsReceivedList.firstChild) {
        divEventsReceivedList.removeChild(divEventsReceivedList.firstChild);
      }
      // tell the backend to clear the events
      bridge.clearEvents();
    },
    false
  );

  bridge.onEventReceived((_, recvEvent) => {
    console.log("* RECEIVED EVENT");
    console.log({ recvEvent });
    const item = createEventListItem(recvEvent);
    divEventsReceivedList.appendChild(item);
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
