import { Module, registerTabModule } from "../../moduleTool";

import config from './moduleConfig';
import getMainComp from './navigator';
import reducer from './reducer';
import { registerTimelineWorkflow } from "./timelineModules";

export default registerTabModule(
    new Module({
        config, getMainComp, reducer
    }),
    0
);

registerTimelineWorkflow(session => ({
    icon: 'new_post',
    i18n: 'common.apply',
    goTo: { routeName: 'timeline/filters' }
}));
