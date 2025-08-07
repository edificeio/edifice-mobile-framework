import { StackActions } from '@react-navigation/native';

import config from './module-config';
import { scrapbookRouteNames } from './navigation';
import getRoot from './navigation/navigator';
import setUpNotifHandlers from './notif-handler';

import { INTENT_TYPE, registerIntent } from '~/app/intents';
import { NavigableModule } from '~/framework/util/moduleTool';

module.exports = new NavigableModule({ config, getRoot, reducer: () => null });

setUpNotifHandlers();

registerIntent('scrapbook', INTENT_TYPE.OPEN_RESOURCE, ({ id }, navigation) => {
  navigation.dispatch(
    StackActions.push(scrapbookRouteNames.details, {
      resourceUri: `/scrapbook#/view-scrapbook/${id}`,
    }),
  );
});
