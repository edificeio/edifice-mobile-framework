import { Trackers } from '~/framework/util/tracker';
import { asyncActionFactory } from '~/infra/actions/asyncActionFactory';
import { asyncActionTypes } from '~/infra/redux/async';
import { IItem, IItems } from '~/modules/workspace/types';
import { IId } from '~/types';

export const actionTypesMove = asyncActionTypes('WORKSPACE_MOVE');

/**
 * request format: {ids: ["dhdhdhh", "hhdhdhdh"]}
 * response format: [number: 2]
 */
export function moveAction(destinationId: string, origineParentId: string, selected: IItems<IItem>) {
  const api = '/workspace/documents/move';
  const parentId = !destinationId || !destinationId.length ? 'owner' : destinationId;
  const ids: string[] = Object.values(selected).reduce((acc: string[], item: IId) => [...acc, item.id], []);
  const root = parentId === 'owner' ? 'root' : parentId;

  Trackers.trackEvent('Workspace', 'MOVE', undefined, Object.keys(selected).length);

  return asyncActionFactory(`${api}/${root}`, { ids, parentId: origineParentId }, actionTypesMove, (data: any) => selected, {
    method: 'put',
  });
}
