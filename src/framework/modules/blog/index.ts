import { EntModule } from '~/app/module';

import { intents } from './intents';
import blogPostDetailsScreen from './screens/blog-post-details';
import blogCreatePostScreen from './screens/create-post';
import blogEditPostScreen from './screens/edit';
import blogExplorerScreen from './screens/explorer';
import blogPostListScreen from './screens/list';
import blogSelectScreen from './screens/select';
import reducer from './store';

// ToDo(blog-migration): the workflow of `timeline` (button « create » of its home, `timeline-workflow.ts`) is no longer registered:
// `timeline` is not loaded. To take back with the switch of `timeline`, as an entry `create` (see `timeline-workflow.ts`).

export default new EntModule({
  entries: {
    myApps: { route: 'blog/explorer' },
  },
  entTrackingName: 'Blog',
  intents,
  matchEntcoreApp: 'Blog',
  modals: {
    'blog/create-post': blogCreatePostScreen,
    'blog/edit': blogEditPostScreen,
  },
  name: 'blog',
  redux: { reducer },
  scope: ['blog', 'userbook'],
  screens: {
    'blog/blog-post-details': blogPostDetailsScreen,
    'blog/explorer': blogExplorerScreen,
    'blog/list': blogPostListScreen,
    'blog/select': blogSelectScreen,
  },
});
