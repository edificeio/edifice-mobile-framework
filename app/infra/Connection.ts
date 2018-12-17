import { NetInfo } from "react-native";
import Tracking from "../tracking/TrackingManager";

export const Connection = {
  isOnline: false
};

let notifyTimer;

const notifyConnectionError = () => {
  if (!notifyTimer || notifyTimer.getHours() !== new Date().getHours()) {
    notifyTimer = new Date();
    Tracking.logEvent("connectionProblem");
  }
};

NetInfo.isConnected.fetch().then(isConnected => {
  console.log("isConnected:", isConnected);
  Connection.isOnline = isConnected;
  if (!isConnected) {
    notifyConnectionError();
  }
});
NetInfo.isConnected.addEventListener("connectionChange", isConnected => {
  console.log("isConnected:", isConnected);
  Connection.isOnline = isConnected;
  if (!isConnected) {
    notifyConnectionError();
  }
});
