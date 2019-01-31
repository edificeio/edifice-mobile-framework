import { NetInfo } from "react-native";
import Tracking from "../tracking/TrackingManager";

const _BACK_LISTENERS_KEY = "back";
const _GONE_LISTENERS_KEY = "gone";
const _networkListeners: { [key: string]: Array<() => void> } = {
  [_BACK_LISTENERS_KEY]: [],
  [_GONE_LISTENERS_KEY]: [],
}
let _isOnline = false;
export const Connection = {
  get isOnline() {
    return _isOnline;
  },
  set isOnline(isOnline: boolean) {
    _isOnline = isOnline;
    //notify listeners that network state changed
    const key = isOnline ? _BACK_LISTENERS_KEY : _GONE_LISTENERS_KEY;
    _networkListeners[key].forEach(listener => listener());
    _networkListeners[key] = [];
  },
  onNextNetworkBack: (listener: () => void) => {
    _networkListeners[_BACK_LISTENERS_KEY].push(listener);
  },
  onNextNetworkGone: (listener: () => void) => {
    _networkListeners[_GONE_LISTENERS_KEY].push(listener);
  }
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
