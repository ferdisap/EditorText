const payloadReady = {
  "ready": true
}
const responseReady = {
  "id": "",
  "type": "init",
  "payload": payloadReady,
  "status": "done",
}
self.postMessage(responseReady);
