import { StackActions } from '@react-navigation/native';

import { assertSession } from '../auth/reducer';
import config from './module-config';
import { blogRouteNames } from './navigation';
import getRoot from './navigation/navigator';
import setUpNotifHandlers from './notif-handler';
import reducer from './reducer';
import registerTimelineWorkflow from './rights';
import { blogService } from './service';

import { INTENT_TYPE, registerIntent } from '~/app/intents';
import { NavigableModule } from '~/framework/util/moduleTool';

module.exports = new NavigableModule({ config, getRoot, reducer });

setUpNotifHandlers();

registerIntent('blog', INTENT_TYPE.OPEN_RESOURCE, async ({ id }, navigation) => {
  blogService.get(assertSession(), id).then(blogInfo => {
    // T.T
    // Need to fetch blog info before navigate to it. It needs to be reworked :c
    if (!blogInfo) return;
    navigation.dispatch(
      StackActions.push(blogRouteNames.blogPostList, {
        selectedBlog: blogInfo,
      }),
    );
  });
});

registerTimelineWorkflow();
