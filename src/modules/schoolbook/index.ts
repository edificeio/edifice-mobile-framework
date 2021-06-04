import { NavigableModule } from "../../framework/util/moduleTool";

import config from './moduleConfig';
import getRoot, { timelineRoutes } from './navigator';
import reducer from './reducer';
import setUpNotifHandlers from './notifHandler';
import { timelineSubModules } from "../../framework/modules/timelinev2/timelineModules";

const module = new NavigableModule({ config, getRoot, reducer });
export default module;

timelineSubModules.register(timelineRoutes);

setUpNotifHandlers();
