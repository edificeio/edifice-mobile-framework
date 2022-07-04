import { Trackers } from '~/framework/util/tracker';
import { asyncActionFactory } from '~/infra/actions/asyncActionFactory';
import { asyncActionTypes } from '~/infra/redux/async';
import { IItem } from '~/modules/workspace/types';
import { IId } from '~/types';
import { IItems } from '~/types/iid';

import { formatResults } from './helpers/documents';

export const actionTypesRestore = asyncActionTypes('WORKSPACE_RESTORE');

export function restoreAction(parentId: string, selected: IItems<IItem>) {
  const api = '/workspace/documents/restore';
  const ids: string[] = Object.values(selected).reduce((acc: string[], item: IId) => [...acc, item.id], []);

  Trackers.trackDebugEvent('Workspace', 'RESTORE', undefined, Object.keys(selected).length);

  return asyncActionFactory(api, { ids, parentId }, actionTypesRestore, formatResults, {
    method: 'put',
  });
}
