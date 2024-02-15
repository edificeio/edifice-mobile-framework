"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ZendeskUnified = void 0;
var _reactNative = require("react-native");
const LINKING_ERROR = `The package 'react-native-zendesk-unified' doesn't seem to be linked. Make sure: \n\n` + _reactNative.Platform.select({
  ios: "- You have run 'pod install'\n",
  default: ''
}) + '- You rebuilt the app after installing the package\n' + '- You are not using Expo Go\n';
const ZendeskUnified = exports.ZendeskUnified = _reactNative.NativeModules.ZendeskUnified ? _reactNative.NativeModules.ZendeskUnified : new Proxy({}, {
  get() {
    throw new Error(LINKING_ERROR);
  }
});
//# sourceMappingURL=ZendeskUnified.module.js.map