import { Trackers } from '~/framework/util/tracker';
import { asyncActionFactory } from '~/infra/actions/asyncActionFactory';
import { asyncActionTypes } from '~/infra/redux/async';
import { IId } from '~/types';
import { IItems } from '~/types/iid';
import config from '~/workspace/config';
import { IItem } from '~/workspace/types';

import { formatResults } from './helpers/documents';

const WORKSPACE_RESTORE = '/workspace/documents/restore';

export const actionTypesRestore = asyncActionTypes(config.createActionType(`${WORKSPACE_RESTORE}`));

export function restoreAction(parentId: string, selected: IItems<IItem>) {
  const ids: string[] = Object.values(selected).reduce((acc: string[], item: IId) => [...acc, item.id], []);

  Trackers.trackDebugEvent('Workspace', 'RESTORE', undefined, Object.keys(selected).length);

  return asyncActionFactory(`${WORKSPACE_RESTORE}`, { ids, parentId }, actionTypesRestore, formatResults, {
    method: 'put',
  });
}
