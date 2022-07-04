/**
 * workspace list actions
 * Build actions to be dispatched to the hworkspace list reducer.
 */
import { asyncActionFactory } from '~/infra/actions/asyncActionFactory';
import { asyncActionTypes } from '~/infra/redux/async';

import { formatResults } from './helpers/formatListFolders';

export const actionTypesFolder = asyncActionTypes('WORKSPACE_FOLDER');

export function listFoldersAction() {
  const api = '/workspace/folders/list?filter=owner&hierarchical=true';
  return asyncActionFactory(api, { parentId: 'owner' }, actionTypesFolder, formatResults, {
    method: 'get',
  });
}
