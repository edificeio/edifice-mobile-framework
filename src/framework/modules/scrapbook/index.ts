import { NavigableModule } from '~/framework/util/moduleTool';

import config from './module-config';
import getRoot from './navigation/navigator';
import setUpNotifHandlers from './notif-handler';
import reducer from './store';

module.exports = new NavigableModule({ config, getRoot, reducer });

setUpNotifHandlers();

// ToDo(scrapbook-migration): the intents are replaced by `intents.resource` (`~/app/module/types`). Declare one at the switch, with
// `resourceType: 'scrapbook'`: it opens the scrapbook (`scrapbookRouteNames.details`, params
// `{ resourceUri: `/scrapbook#/view-scrapbook/${resource.resourceId}` }`) and gives `true`.
