/**
 * Debug module
 *
 * Developer tools (app infos, app log, network log), shown only when `appConf.isDebugEnabled`. A core module: its modals exist at
 * every auth stage, as they are opened from the platform list, before sign-in (`DebugOptions`).
 */
import { CoreModule } from '~/app/module';

import debugInfosModal from './screens/infos';
import debugLogModal from './screens/log';
import debugNetworkModal from './screens/network';

export default new CoreModule({
  modals: {
    'debug/infos': debugInfosModal,
    'debug/log': debugLogModal,
    'debug/network': debugNetworkModal,
  },
  name: 'debug',
});
