import type { AuthActiveAccount } from '~/framework/modules/auth/model';
import { createRegistry } from '~/framework/util/registry';

const homeWidgets = createRegistry();

export const registerHomeWidget = homeWidgets.register;

export const getVisibleHomeWidgets = (session: AuthActiveAccount) =>
  homeWidgets.getAll().filter(widget => widget.isVisible(session));

export const hasVisibleHomeWidgets = (session: AuthActiveAccount) => homeWidgets.getAll().some(widget => widget.isVisible(session));
