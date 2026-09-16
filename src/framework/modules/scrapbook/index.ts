import { StackActions } from '@react-navigation/native';

import { INTENT_TYPE, registerIntent } from '~/app/intents';
import { Reducers } from '~/app/store';
import { NavigableModule } from '~/framework/util/moduleTool';

import config from './module-config';
import { scrapbookRouteNames } from './navigation';
import getRoot from './navigation/navigator';
import setUpNotifHandlers from './notif-handler';
import reducer from './store';

module.exports = new NavigableModule({ config, getRoot, reducer });

Reducers.register(config.reducerName, reducer);

setUpNotifHandlers();

registerIntent('Cahier Multimédia', INTENT_TYPE.OPEN_RESOURCE, ({ id }, navigation) => {
  navigation.dispatch(
    StackActions.push(scrapbookRouteNames.details, {
      resourceUri: `/scrapbook#/view-scrapbook/${id}`,
    }),
  );
});
