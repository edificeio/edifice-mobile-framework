import React from 'react';

import { AccountStorageProvider } from '~/framework/util/storage/account-context';
import type { AuthActiveAccount } from '~/modules/auth/model';
import { useSession } from '~/modules/auth/store/accounts';

/**
 * Renders the component only while there is a session, and gives it as the `session` prop, so the component never has to handle
 * the lack of session.
 * Without any it throws: it is caught by the `ErrorBoundary` of the screen layout (`BaseStackScreenLayout`), as rendering a screen
 * that needs a session while there is none is a mistake of the navigation.
 *
 * It also tells the account storage hooks (`useStorage*` of `Storage.account` storages) which account they work on: the one of the
 * session, which does not change as long as the component is mounted. It is not required to use them (they fall back to the current
 * account), but it is what makes them stable.
 */
export function withSession<Props extends object>(WrappedComponent: React.ComponentType<Props & { session: AuthActiveAccount }>) {
  const NewComponent = React.memo(function (props: Props) {
    const session = useSession();
    if (!session)
      throw new Error(
        `[Auth] Component ${WrappedComponent.displayName ?? WrappedComponent.name} cannot be rendered without an active session.`,
      );
    return (
      <AccountStorageProvider accountId={session.user.id}>
        <WrappedComponent session={session} {...props} />
      </AccountStorageProvider>
    );
  });
  NewComponent.displayName = `withSession(${WrappedComponent.displayName ?? WrappedComponent.name})`;
  return NewComponent;
}
