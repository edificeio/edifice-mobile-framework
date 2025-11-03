import { StackActions } from '@react-navigation/native';
import { Reducer } from 'redux';

import { default as config } from './module-config';
import { wikiRouteNames } from './navigation';
import getRoot from './navigation/navigator';
import setUpNotifHandlers from './notif-handler';
import { reducer, WikiStore } from './store';

import { INTENT_TYPE, registerIntent } from '~/app/intents';
import { Reducers } from '~/app/store';
import type { ExplorerAction } from '~/framework/modules/explorer/store';
import { NavigableModule } from '~/framework/util/moduleTool';

module.exports = new NavigableModule({
  config,
  getRoot,
  reducer: reducer as unknown as Reducer<WikiStore, ExplorerAction>,
});

Reducers.register(config.reducerName, reducer as unknown as Reducer<WikiStore, ExplorerAction>);

registerIntent('wiki', INTENT_TYPE.OPEN_RESOURCE, ({ id }, navigation) => {
  navigation.dispatch(
    StackActions.push(wikiRouteNames.summary, {
      resourceId: id,
    }),
  );
});

setUpNotifHandlers();
