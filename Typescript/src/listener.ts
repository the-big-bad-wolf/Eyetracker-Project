import * as WebSocket from "ws";
import {
  offerHelpNotification,
  pauseNotification,
  updateStatusBarData,
} from "./extension";

export function setUp() {
  const ws = new WebSocket("ws://localhost:8080");

  ws.on("error", console.error);

  ws.on("open", function open() {
    ws.send("something");
  });

  ws.on("message", function message(data) {
    console.log("received: %s", data);

    let JSONData = JSON.parse(data.toString());

    if (JSONData["Need help"] == "True") {
      offerHelpNotification();
    }

    /*if (JSONData["Is stressed"] == "True") {
      offerPauseNotification()
    }*/

    updateStatusBarData(data);
  });
}
