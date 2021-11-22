import { NavigableModule } from "../../util/moduleTool";

import config from './moduleConfig';
import getRoot from './navigator';
import reducer from './reducer';

import setUpNotifHandlers from './notifHandler';

export default new NavigableModule({ config, getRoot, reducer });

setUpNotifHandlers();
