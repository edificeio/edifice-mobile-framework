import React from 'react';

import { CoreModule } from '~/app/module';
import { setModalModeForRoutes } from '~/framework/navigation/hideTabBarAndroid';

import { CommentsThreadReplyScreen, CommentsThreadReplyScreenOptions } from './screens/reply/screen';
import { CommentItem } from './types';

export default new CoreModule<'comments', { 'comments/reply': { id: CommentItem['id'] } }>(
  {
    name: 'comments',
  },
  Stack => (
    <>
      <Stack.Screen name="comments/reply" component={CommentsThreadReplyScreen} options={CommentsThreadReplyScreenOptions} />
    </>
  ),
);

setModalModeForRoutes(['comments/reply']);

export { ResourceWithComments } from './templates/resource-with-comments';
