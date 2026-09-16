import { StackActions } from '@react-navigation/native';

import { INTENT_TYPE, registerIntent } from '~/app/intents';
import { NavigableModule } from '~/framework/util/moduleTool';

import config from './module-config';
import { blogRouteNames } from './navigation';
import getRoot from './navigation/navigator';
import setUpNotifHandlers from './notif-handler';
import reducer from './reducer';
import registerTimelineWorkflow from './rights';

module.exports = new NavigableModule({ config, getRoot, reducer });

setUpNotifHandlers();

registerIntent('Blog', INTENT_TYPE.OPEN_RESOURCE, async ({ id }, navigation) => {
  navigation.dispatch(
    StackActions.push(blogRouteNames.blogPostList, {
      blogId: id,
    }),
  );
});

registerTimelineWorkflow();
