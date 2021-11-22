import { NavigableModule } from "~/framework/util/moduleTool";

import config from './moduleConfig';
import getRoot from './navigator';
import reducer from './reducer';

import setUpNotifHandlers from './notifHandler';

module.exports = new NavigableModule({ config, getRoot, reducer });

setUpNotifHandlers();
