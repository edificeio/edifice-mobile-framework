import { Trackers } from '~/framework/util/tracker';
import { asyncActionFactory } from '~/infra/actions/asyncActionFactory';
import { asyncActionTypes } from '~/infra/redux/async';
import { IId } from '~/types';
import config from '~/workspace/config';
import { IItem, IItems } from '~/workspace/types';

const WORKSPACE_MOVE = '/workspace/documents/move';

export const actionTypesMove = asyncActionTypes(config.createActionType(`${WORKSPACE_MOVE}`));

/**
 * request format: {ids: ["dhdhdhh", "hhdhdhdh"]}
 * response format: [number: 2]
 */
export function moveAction(destinationId: string, origineParentId: string, selected: IItems<IItem>) {
  const parentId = !destinationId || !destinationId.length ? 'owner' : destinationId;
  const ids: string[] = Object.values(selected).reduce((acc: string[], item: IId) => [...acc, item.id], []);
  const root = parentId === 'owner' ? 'root' : parentId;

  Trackers.trackEvent('Workspace', 'MOVE', undefined, Object.keys(selected).length);

  return asyncActionFactory(
    `${WORKSPACE_MOVE}/${root}`,
    { ids, parentId: origineParentId },
    actionTypesMove,
    (data: any) => selected,
    {
      method: 'put',
    },
  );
}
