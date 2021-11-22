import { NavigableModule } from "../../framework/util/moduleTool";

import config from './moduleConfig';
import getRoot, { timelineRoutes } from './navigator';
import reducer from './reducer';
import setUpNotifHandlers from './notifHandler';
import { timelineSubModules } from "../../framework/modules/timelinev2/timelineModules";

module.exports = new NavigableModule({ config, getRoot, reducer });

timelineSubModules.register(timelineRoutes);

setUpNotifHandlers();
