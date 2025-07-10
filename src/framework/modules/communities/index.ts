import config from './module-config';
import getRoot from './navigation/navigator';
import setUpNotifHandlers from './notif-handler';
import { reducer } from './store';

import { Reducers } from '~/app/store';
import { NavigableModule } from '~/framework/util/moduleTool';

module.exports = new NavigableModule({ config, getRoot, reducer });

Reducers.register(config.reducerName, reducer);

setUpNotifHandlers();
