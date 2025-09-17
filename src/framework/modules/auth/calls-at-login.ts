/**
 * Register here actions that need to be called when a users logs in.
 * Be careful the calls are unordered and promises are not awaited.
 */

const callsAtLogin: (() => any)[] = [];
export const callAtLogin = (callback: () => any) => callsAtLogin.push(callback);
export const callRegisteredActionsAtLogin = () => callsAtLogin.forEach(callback => callback());
