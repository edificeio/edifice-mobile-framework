import { Reducer } from 'redux';

import config from './module-config';
import getRoot from './navigation/navigator';
import setUpNotifHandlers from './notif-handler';
import { reducer, WikiStore } from './store';

import { Reducers } from '~/app/store';
import type { ExplorerAction } from '~/framework/modules/explorer/store';
import { NavigableModule } from '~/framework/util/moduleTool';

module.exports = new NavigableModule({
  config,
  getRoot,
  reducer: reducer as unknown as Reducer<WikiStore, ExplorerAction>,
});

Reducers.register(config.reducerName, reducer as unknown as Reducer<WikiStore, ExplorerAction>);

setUpNotifHandlers();
