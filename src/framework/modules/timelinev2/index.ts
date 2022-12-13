import { NavigableModule } from '~/framework/util/moduleTool';

import config from './moduleConfig';
import getRoot from './navigation/navigator';
import setUpNotifHandlers from './notifHandler';
import reducer from './reducer';

module.exports = new NavigableModule({ config, getRoot, reducer });

setUpNotifHandlers();
