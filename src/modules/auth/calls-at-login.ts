/**
 * @deprecated Use `onSessionStart` in the config of your module (it also gets the session and a `signal`).
 *
 * Registers an action to call when a session starts. The calls are not ordered and the promises are not awaited.
 * It must be called when the code is loaded, before the first session: unlike `onSessionStart`, a late call is not replayed.
 */
const callsAtLogin: (() => any)[] = [];

export const callAtLogin = (callback: () => any) => callsAtLogin.push(callback);

/** The registered actions, for the start of a session. */
export const getCallsAtLogin = () => callsAtLogin;

/** @internal for tests. */
export const clearCallsAtLogin = () => {
  callsAtLogin.length = 0;
};
