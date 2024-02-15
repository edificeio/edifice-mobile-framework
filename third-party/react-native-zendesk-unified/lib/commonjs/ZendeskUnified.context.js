"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ZendeskContext = void 0;
exports.ZendeskProvider = ZendeskProvider;
exports.useZendesk = useZendesk;
var _react = _interopRequireWildcard(require("react"));
var _ = require(".");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
/**
 * Context to provide the Zendesk instance to the ZendeskProvider
 */
const ZendeskContext = exports.ZendeskContext = /*#__PURE__*/(0, _react.createContext)(undefined);

/**
 * Hook to get the Zendesk instance from the ZendeskContext
 */
function useZendesk() {
  const context = (0, _react.useContext)(ZendeskContext);
  if (!context) {
    throw new Error('useZendesk must be used within an ZendeskProvider');
  }
  return context;
}
/**
 * Provider to wrap your app with to get access to the Zendesk instance
 * @param children
 * @param zendeskConfig The {@link ZendeskConfig} to initialize the {@link Zendesk} instance with.
 */
function ZendeskProvider({
  children,
  zendeskConfig
}) {
  const ZendeskInstance = new _.Zendesk(zendeskConfig);
  return /*#__PURE__*/_react.default.createElement(ZendeskContext.Provider, {
    value: ZendeskInstance
  }, children);
}
//# sourceMappingURL=ZendeskUnified.context.js.map