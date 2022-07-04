import { Trackers } from '~/framework/util/tracker';
import { asyncActionFactory } from '~/infra/actions/asyncActionFactory';
import { asyncActionTypes } from '~/infra/redux/async';
import { IItems } from '~/modules/workspace/reducers/select';
import { IItem } from '~/modules/workspace/types/states';

import { formatResults } from './helpers/documents';

export const actionTypesDelete = asyncActionTypes('WORKSPACE_TRASH');

export function trashAction(parentId: string, selected: IItems<IItem>) {
  const api = '/workspace/documents/trash';
  const toDelete: string[] = Object.values(selected).reduce((acc: string[], item) => [...acc, item.id], []);

  Trackers.trackEvent('Workspace', 'TRASH', undefined, Object.keys(selected).length);

  return asyncActionFactory(api, { ids: toDelete, parentId }, actionTypesDelete, formatResults, {
    method: 'put',
  });
}

export function deleteAction(parentId: string, selected: IItems<IItem>) {
  const api = '/workspace/documents';
  const toDelete: string[] = Object.values(selected).reduce((acc: string[], item) => [...acc, item.id], []);

  Trackers.trackEvent('Workspace', 'DELETE', undefined, Object.keys(selected).length);

  return asyncActionFactory(api, { ids: toDelete, parentId }, actionTypesDelete, () => formatResults(toDelete, parentId), {
    method: 'delete',
  });
}
