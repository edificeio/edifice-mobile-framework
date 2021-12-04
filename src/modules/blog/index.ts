import config from './moduleConfig';
import getRoot, { timelineRoutes } from './navigator';
import setUpNotifHandlers from './notifHandler';
import reducer from './reducer';
import setUpWorkflow from './rights';

import { timelineSubModules } from '~/framework/modules/timelinev2/timelineModules';
import { NavigableModule } from '~/framework/util/moduleTool';

module.exports = new NavigableModule({ config, getRoot, reducer });

timelineSubModules.register(timelineRoutes);

setUpNotifHandlers();
setUpWorkflow();
