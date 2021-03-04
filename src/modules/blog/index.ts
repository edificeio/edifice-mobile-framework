import { Module } from "../../framework/moduleTool";

import config from './moduleConfig';
import getMainComp from './navigator';
import reducer from './reducer';
import setUpNotifHandlers from './notifHandler';
import setUpWorkflow from './workflow';
import { registerTimelineModule } from "../../framework/modules/timelinev2/timelineModules";

export default registerTimelineModule(
    new Module({
        config, getMainComp, reducer
    })
);

setUpNotifHandlers();
setUpWorkflow();
