import config from './module-config';
import getRoot from './navigation/navigator';
import setUpNotifHandlers from './notif-handler';
import reducer from './reducer';

import { NavigableModule } from '~/framework/util/moduleTool';

module.exports = new NavigableModule({ config, getRoot, reducer });

setUpNotifHandlers();
// @scaffolder Add here every side-effects form having this module in the app.
// This includes registrations into other utility, like notifications, timeline workflows, etc.
