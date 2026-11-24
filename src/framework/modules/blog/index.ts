import { NavigableModule } from '~/framework/util/moduleTool';

import config from './module-config';
import getRoot from './navigation/navigator';
import setUpNotifHandlers from './notif-handler';
import { reducer } from './reducer';
import registerTimelineWorkflow from './rights';

module.exports = new NavigableModule({ config, getRoot, reducer });

setUpNotifHandlers();

// ToDo(blog-migration): the intents are replaced by `intents.resource` (`~/app/module/types`). Declare one at the switch, with
// `resourceType: 'blog'`: it opens the list of the posts of the blog (`blogRouteNames.blogPostList`, params
// `{ blogId: resource.resourceId }`) and gives `true`.

registerTimelineWorkflow();
