import { NavigableModule } from '~/framework/util/moduleTool';

import config from './module-config';
import getRoot from './navigation/navigator';
import setUpNotifHandlers from './notif-handler';
import reducer from './reducer';
import { preferences, storage } from './storage';

module.exports = new NavigableModule({ config, getRoot, reducer, storage, preferences });

setUpNotifHandlers();
