import React from 'react';

import toast from '~/framework/components/toast';
import { useAuthFlows } from '~/modules/auth/flows';
import type { AuthActiveAccount, AuthSavedAccount } from '~/modules/auth/model';
import { getActiveAccount } from '~/modules/auth/store/accounts';
import { I18n } from '~/util/i18n';

/**
 * What a screen that lists the accounts does when the user asks to remove one: it asks to confirm (`confirmRemoveAccount`), removes
 * the account, then tells the user it is done.
 * Not exported by `hooks/index.ts`: it is for the screens of the module only.
 * @param onConfirm Called once the user confirmed, before the removal (tracking...). Must be a stable reference.
 * @returns `onDelete` of the accounts lists. Errors are only logged.
 */
export const useRemoveAccountHandler = (onConfirm?: () => void | Promise<void>) => {
  const { confirmRemoveAccount } = useAuthFlows();
  return React.useCallback(
    async (account: AuthSavedAccount | AuthActiveAccount) => {
      try {
        const wasActive = getActiveAccount()?.user.id === account.user.id;
        const removed = await confirmRemoveAccount(account, { beforeRemove: onConfirm });
        // Removing the connected account logs it out: the user is sent to the sign-in screens, no toast then.
        if (removed && !wasActive) toast.showSuccess(I18n.get('auth-accountlist-delete-success'));
      } catch (e) {
        console.error(e);
      }
    },
    [confirmRemoveAccount, onConfirm],
  );
};
