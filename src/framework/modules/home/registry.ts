import type { AuthActiveAccount } from '~/framework/modules/auth/model';
import { createRegistry } from '~/framework/util/registry';

const homeSections = createRegistry();

export const registerHomeSection = homeSections.register;

export const getVisibleHomeSections = (session: AuthActiveAccount) =>
  homeSections.getAll().filter(section => section.isVisible(session));
