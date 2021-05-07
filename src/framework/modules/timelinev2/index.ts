import { tabModules, NavigableModule } from "../../util/moduleTool";

import config from './moduleConfig';
import getRoot from './navigator';
import reducer from './reducer';

import setUpNotifHandlers from './notifHandler';

export default tabModules.register(
    new NavigableModule({ config, getRoot, reducer }),
    0
);

setUpNotifHandlers();
