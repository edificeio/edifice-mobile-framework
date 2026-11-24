import { Reducer } from 'redux';

import type { ExplorerAction } from '~/framework/modules/explorer/store';
import { NavigableModule } from '~/framework/util/moduleTool';

import { default as config } from './module-config';
import getRoot from './navigation/navigator';
import setUpNotifHandlers from './notif-handler';
import { reducer, WikiStore } from './store';

module.exports = new NavigableModule({
  config,
  getRoot,
  reducer: reducer as unknown as Reducer<WikiStore, ExplorerAction>,
});

// ToDo(wiki-migration): the intents are replaced by `entries.resource` (`~/app/module/types`). Declare it at the switch: it opens the
// summary of the wiki (`wikiRouteNames.summary`, params `{ resourceId: media.resourceId }`).

setUpNotifHandlers();
