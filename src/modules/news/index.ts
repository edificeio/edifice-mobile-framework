import config from './moduleConfig';
import getRoot, { timelineRoutes } from './navigator';
import setUpNotifHandlers from './notifHandler';
import reducer from './reducer';

import { timelineSubModules } from '~/framework/modules/timelinev2/timelineModules';
import { Module } from '~/framework/util/moduleTool';

module.exports = new Module({ config, getRoot, reducer });

timelineSubModules.register(timelineRoutes);

setUpNotifHandlers();
