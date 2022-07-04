import { Trackers } from '~/framework/util/tracker';
import { asyncActionFactory } from '~/infra/actions/asyncActionFactory';
import { getExtension } from '~/infra/actions/downloadHelper';
import { asyncActionTypes } from '~/infra/redux/async';
import { IItems } from '~/modules/workspace/reducers/select';
import { IItem } from '~/modules/workspace/types';

import { formatResults } from './helpers/documents';

export const actionTypesRename = asyncActionTypes('WORKSPACE_RENAME');

/**
 * Rename document.
 * Dispatches WORKSPACE_RENAME_REQUESTED, WORKSPACE_RENAME_RECEIVED, and WORKSPACE_RENAME_FETCH_ERROR if an error occurs.
 */
export function renameAction(parentId: string, selected: IItems<IItem>, name: string) {
  const item = Object.values(selected)[0];
  const url = item.isFolder ? `/workspace/folder/rename/${item.id}` : `/workspace/rename/${item.id}`;

  Trackers.trackEvent('Workspace', 'RENAME', (item as IItem).isFolder ? 'Folder' : getExtension((item as IItem).name));

  return asyncActionFactory(url, { name, parentId }, actionTypesRename, formatResults, { method: 'put' });
}
