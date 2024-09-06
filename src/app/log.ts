import { InteractionManager } from 'react-native';
import RNFS from 'react-native-fs';
import { consoleTransport, fileAsyncTransport, logger } from 'react-native-logs';

import appConf from '~/framework/util/appConf';

export namespace Log {
  let log;
  const logFileName = 'appe.log';

  export async function init() {
    if (appConf.isDevOrAlpha) {
      try {
        // initialize logger
        log = logger.createLogger({
          async: true,
          asyncFunc: InteractionManager.runAfterInteractions,
          levels: {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3,
          },
          transport: [consoleTransport, fileAsyncTransport],
          transportOptions: {
            colors: {
              debug: 'white',
              info: 'blueBright',
              warn: 'yellowBright',
              error: 'redBright',
            },
            fileName: logFileName,
            FS: RNFS,
            mapLevels: {
              debug: 'log',
              info: 'info',
              warn: 'warn',
              error: 'error',
            },
          },
        });
        // Patch standard console.* statements
        log?.patchConsole();
        // First log statement
        console.info('APP LAUNCH ---------->');
      } catch (e) {
        console.error('Unable to initialize logger: ', (e as Error).message);
      }
    }
  }

  export async function clear() {
    try {
      RNFS.unlink(`${RNFS.DocumentDirectoryPath}/${logFileName}`);
    } catch (e) {
      console.error('Unable to clear log: ', (e as Error).message);
    }
  }

  export function pause() {
    log?.disable();
  }

  export function resume() {
    log?.enable();
  }
}
