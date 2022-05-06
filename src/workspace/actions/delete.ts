import { Trackers } from '~/framework/util/tracker';
import { asyncActionFactory } from '~/infra/actions/asyncActionFactory';
import { asyncActionTypes } from '~/infra/redux/async';
import config from '~/workspace/config';
import { IItems } from '~/workspace/reducers/select';
import { IItem } from '~/workspace/types/states';

import { formatResults } from './helpers/documents';

const WORKSPACE_TRASH = '/workspace/documents/trash';
const WORKSPACE_DELETE = '/workspace/documents';

export const actionTypesDelete = asyncActionTypes(config.createActionType(`${WORKSPACE_TRASH}`));

export function trashAction(parentId: string, selected: IItems<IItem>) {
  const toDelete: string[] = Object.values(selected).reduce((acc: string[], item) => [...acc, item.id], []);

  Trackers.trackEvent('Workspace', 'TRASH', undefined, Object.keys(selected).length);

  return asyncActionFactory(`${WORKSPACE_TRASH}`, { ids: toDelete, parentId }, actionTypesDelete, formatResults, {
    method: 'put',
  });
}

export function deleteAction(parentId: string, selected: IItems<IItem>) {
  const toDelete: string[] = Object.values(selected).reduce((acc: string[], item) => [...acc, item.id], []);

  Trackers.trackEvent('Workspace', 'DELETE', undefined, Object.keys(selected).length);

  return asyncActionFactory(
    `${WORKSPACE_DELETE}`,
    { ids: toDelete, parentId },
    actionTypesDelete,
    () => formatResults(toDelete, parentId),
    {
      method: 'delete',
    },
  );
}
