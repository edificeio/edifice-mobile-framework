import { getStore } from '~/app/store';
import { RootFolderId } from '~/framework/modules/explorer/model/types';
import { API } from '~/framework/modules/explorer/service/types';
import { selectExplorerFolder } from '~/framework/modules/explorer/store';
import { I18n } from '~/util/i18n';

import type { ResourceExplorerTemplate } from './types';

/**
 * Options of a screen that shows the template, for the `options` of `defineScreen`: the title of the folder shown, or the home title.
 * Read in the store when the screen opens: the title of a subfolder is known before (kept when its parent folder was loaded).
 */
export const explorerScreenHeader =
  (context: API.Explorer.ContextQuery, homeTitleI18n: string) =>
  ({ route }: { route: { params?: ResourceExplorerTemplate.NavParams } }) => {
    const folderId = route.params?.folderId ?? RootFolderId.ROOT;
    const folder = selectExplorerFolder(context, folderId)(getStore().getState());
    return { title: folder?.metadata?.title ?? I18n.get(homeTitleI18n) };
  };
