import { NavigableModule } from '~/framework/util/moduleTool';

import config from './module-config';
import getRoot from './navigation/navigator';
import setUpNotifHandlers from './notif-handler';
import reducer from './reducers';
import registerTimelineWorkflow from './rights';

module.exports = new NavigableModule({ config, getRoot, reducer });

setUpNotifHandlers();

registerTimelineWorkflow();
