import type { AnyAction } from 'redux';

import { getStore } from '~/app/store';

/**
 * Redux still holds the state of the not yet migrated modules.
 * The dispatch of its store is typed by the (currently empty) list of migrated modules reducers, hence the cast.
 */
export const dispatchToLegacyStore = (action: AnyAction) => getStore().dispatch(action as never);
