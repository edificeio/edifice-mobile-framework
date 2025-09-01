import { DebugOptions } from './components/component';
import config from './module-config';
import { infosNavBar, InfosScreen } from './screens/infos/screen';
import { logNavBar, LogScreen } from './screens/log/screen';
import { networkNavBar, NetworkScreen } from './screens/network/screen';

import { Module } from '~/framework/util/moduleTool';

export default new Module({ config, reducer: () => null });

export { DebugOptions, infosNavBar, InfosScreen, logNavBar, LogScreen, networkNavBar, NetworkScreen };
