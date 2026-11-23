// ToDo(explorer-migration): remove once no module of the legacy navigation imports it (`homework`, `scrapbook`, `wiki`)
import { screenOptions } from '~/app/navigation/util';
import { RootFolderId } from '~/framework/modules/explorer/model/types';
import { API } from '~/framework/modules/explorer/service/types';

import { explorerScreenHeader } from './options';

/**
 * Title of a screen of the legacy navigation that shows the template, read in the store of `explorer`.
 * @deprecated use `explorerScreenHeader` in the `options` of `defineScreen`.
 */
export const createResourceExplorerNavBar = (homeFolderi18n: string, context: API.Explorer.ContextQuery) =>
  screenOptions(({ route: { params: { folderId = RootFolderId.ROOT } = {} } }) =>
    explorerScreenHeader(context, homeFolderi18n)({ route: { params: { folderId } } }),
  );
