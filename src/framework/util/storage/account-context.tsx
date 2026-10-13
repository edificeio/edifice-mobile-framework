import React from 'react';

const AccountStorageContext = React.createContext<string | undefined>(undefined);

/**
 * Tells the hooks of the account storages (`Storage.account`) which account they work on: the one of the components below.
 * Given by whoever manages the sessions (the `withSession` of the auth module), so the hooks are only used with an account.
 */
export const AccountStorageProvider = ({ accountId, children }: React.PropsWithChildren<{ accountId: string }>) => (
  <AccountStorageContext.Provider value={accountId}>{children}</AccountStorageContext.Provider>
);

/** The account the components below work on, if some provider tells it. */
export const useAccountStorageId = () => React.useContext(AccountStorageContext);
