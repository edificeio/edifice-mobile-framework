import { Trackers } from '~/framework/util/tracker';
import { asyncActionFactory } from '~/infra/actions/asyncActionFactory';
import { getExtension } from '~/infra/actions/downloadHelper';
import { asyncActionTypes } from '~/infra/redux/async';
import config from '~/workspace/config';
import { IItems } from '~/workspace/reducers/select';
import { IItem } from '~/workspace/types';

import { formatResults } from './helpers/documents';

const WORKSPACE_RENAME = '/workspace/rename';
const WORKSPACE_FOLDER_RENAME = '/workspace/folder/rename';

export const actionTypesRename = asyncActionTypes(config.createActionType(`${WORKSPACE_RENAME}`));

/**
 * Rename document.
 * Dispatches WORKSPACE_RENAME_REQUESTED, WORKSPACE_RENAME_RECEIVED, and WORKSPACE_RENAME_FETCH_ERROR if an error occurs.
 */
export function renameAction(parentId: string, selected: IItems<IItem>, name: string) {
  const item = Object.values(selected)[0];
  const url = item.isFolder ? `${WORKSPACE_FOLDER_RENAME}/${item.id}` : `${WORKSPACE_RENAME}/${item.id}`;

  Trackers.trackEvent('Workspace', 'RENAME', (item as IItem).isFolder ? 'Folder' : getExtension((item as IItem).name));

  return asyncActionFactory(url, { name, parentId }, actionTypesRename, formatResults, { method: 'put' });
}
