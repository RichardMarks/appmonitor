# App Monitor

A development tool for recording logs from React Native apps without all the noise.

At the moment you have to clone the project from this repository, install the dependencies and launch the tool.

```bash
yarn install
yarn start
```

### How do I use this?

By itself, the tool simply starts an HTTP server on a port you specify in the UI, and listens for requests. [See requests](#request-details)

Launch the App Monitor tool, enter the port you configured for your project, and press the Start Server button.

Any events captured from the app will be displayed in the App Monitor tool window. From here you can export the events as JSON, CSV, and Plain Text.

#### React Native

There is a companion package for React Native projects. [See `appmonitor-react-native`](https://github.com/RichardMarks/appmonitor-react-native)

### Request Details

To send an event to the App Monitor tool:

Endpoint: `{host}:{port}/appmonitor/event`

Method: `POST`

Body:

```json
{
  "name": "Test Event",
  "message": "This is a test event for the AppMonitor",
  "someValue": 100,
  "somethingElse": {
    "nestedValue": false
  }
}
```

To get a list of all events received:

Endpoint: `{host}:{port}/appmonitor/events`

Method: `GET`

Response:

```json
{
  "time": 1648942969264,
  "name": "Test Event",
  "message": "This is a test event for the AppMonitor",
  "detail": {
    "someValue": 100,
    "somethingElse": {
      "nestedValue": false
    }
  }
}
```
