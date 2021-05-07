import { NavigableModule } from "../../framework/util/moduleTool";

import config from './moduleConfig';
import getRoot from './navigator';
import reducer from './reducer';
import setUpNotifHandlers from './notifHandler';
import setUpWorkflow from './rights';
import { timelineModules } from "../../framework/modules/timelinev2/timelineModules";

export default timelineModules.register(
    new NavigableModule({ config, getRoot, reducer })
);

setUpNotifHandlers();
setUpWorkflow();
