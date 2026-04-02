import React from 'react';

import { useSelector } from 'react-redux';

import { AuthActiveAccount } from './model';
import { selectors } from './redux/reducer';

export function withSession<Props extends object>(WrappedComponent: React.ComponentType<Props & { session: AuthActiveAccount }>) {
  const NewComponent = function (props: Props) {
    const session = useSelector(selectors.session);
    if (!session) throw new Error(`[Auth] Component ${WrappedComponent.displayName} cannot be rendered without an active session.`);
    return <WrappedComponent session={session} {...props} />;
  };
  NewComponent.displayName = `withSession(${WrappedComponent.displayName})`;
  return NewComponent;
}
