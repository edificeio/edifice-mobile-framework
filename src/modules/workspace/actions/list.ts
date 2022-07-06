/**
 * workspace list actions
 * Build actions to be dispatched to the hworkspace list reducer.
 */
import { asyncActionRawFactory } from '~/infra/actions/asyncActionFactory';
import { asyncActionTypes, asyncGetJson } from '~/infra/redux/async';
import { Filter, IFiltersParameters, IFolder, IItems } from '~/modules/workspace/types';
import { IId } from '~/types';

import { formatResults } from './helpers/documents';
import { factoryRootFolder } from './helpers/factoryRootFolder';

const getRootFolders: () => IItems<IFolder> = () => {
  return {
    [Filter.OWNER]: factoryRootFolder(Filter.OWNER),
    [Filter.PROTECTED]: factoryRootFolder(Filter.PROTECTED),
    [Filter.SHARED]: factoryRootFolder(Filter.SHARED),
    [Filter.TRASH]: factoryRootFolder(Filter.TRASH),
  };
};

function getDocuments(payload: IFiltersParameters): Promise<IItems<IId | string>> {
  let params = `?filter=${payload.filter}`;

  if (!Object.values(Filter).includes(payload.parentId as Filter)) {
    params += `&parentId=${payload.parentId}`;
  }
  params += '&includeall=true';
  return asyncGetJson(`/workspace/documents${params}`, formatResults);
}

export const actionTypesList = asyncActionTypes('WORKSPACE_LIST');

/**
 * Get workspace list from the backend.
 * Dispatches WORKSPACE_LIST_REQUESTED, WORKSPACE_LIST_RECEIVED, and WORKSPACE_LIST_FETCH_ERROR if an error occurs.
 */
export function listAction(payload: IFiltersParameters) {
  return asyncActionRawFactory(actionTypesList, payload, async () => {
    if (payload.parentId === Filter.ROOT) {
      return getRootFolders();
    }
    return getDocuments(payload);
  });
}
