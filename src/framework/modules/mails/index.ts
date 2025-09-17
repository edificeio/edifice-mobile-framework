import config from './module-config';
import getRoot from './navigation/navigator';
import setUpNotifHandlers from './notif-handler';
import { reloadVisibles } from './storage';
import { callAtLogin } from '../auth/calls-at-login';

import { NavigableModule } from '~/framework/util/moduleTool';

module.exports = new NavigableModule({ config, getRoot, reducer: () => null });

setUpNotifHandlers();

callAtLogin(reloadVisibles);
