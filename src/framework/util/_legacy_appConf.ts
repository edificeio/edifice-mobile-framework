// /**
//  * Global configuration loader.
//  * Use this module to load `ode-framework-conf` properly.
//  */

import { Platform } from './appConf';

// Waiting the new session management, use this to store the active platform information;
let DEPRECATED_currentPlatform: Platform | undefined = undefined;
export const DEPRECATED_setCurrentPlatform = (pf: Platform | undefined) => {
  DEPRECATED_currentPlatform = pf;
};
export const DEPRECATED_getCurrentPlatform = () => DEPRECATED_currentPlatform as Readonly<typeof DEPRECATED_currentPlatform>;
