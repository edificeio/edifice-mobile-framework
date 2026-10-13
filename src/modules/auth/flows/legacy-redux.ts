import type { AnyAction } from 'redux';

import { getStore } from '~/app/store';
import { actions as legacyAuthActions } from '~/framework/modules/auth/redux/actions';
import { createEndSessionAction } from '~/framework/util/redux/reducerFactory';
import type { AuthActiveAccount } from '~/modules/auth/model';
import { registerSessionReset } from '~/modules/auth/store/session';

/**
 * Redux still holds the state of the not yet migrated modules.
 * The dispatch of its store is typed by the (currently empty) list of migrated modules reducers, hence the cast.
 */
export const dispatchToLegacyStore = (action: AnyAction) => getStore().dispatch(action as never);

// The session reducers of the not yet migrated modules are flushed with the other session data, when a session ends
registerSessionReset(() => dispatchToLegacyStore(createEndSessionAction()));

/**
 * Tells the not yet migrated modules that an account (with no requirement left) is now the connected one:
 * some of their reducers reset their selection (e.g. the selected child of `viescolaire`) on this occasion.
 */
export const notifyLegacyAccountSet = (account: AuthActiveAccount, accountToReplaceId?: string) =>
  dispatchToLegacyStore(
    accountToReplaceId ? legacyAuthActions.replaceAccount(accountToReplaceId, account) : legacyAuthActions.addAccount(account),
  );
