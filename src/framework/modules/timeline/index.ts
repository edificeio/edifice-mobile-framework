import config from './module-config';
import getRoot from './navigation/navigator';
import setUpNotifHandlers from './notif-handler';
import reducer from './reducer';
import { preferences, storage } from './storage';

import { NavigableModule } from '~/framework/util/moduleTool';

module.exports = new NavigableModule({ config, getRoot, preferences, reducer, storage });

setUpNotifHandlers();
