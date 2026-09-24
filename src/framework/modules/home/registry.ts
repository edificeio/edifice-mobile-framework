import type { AuthActiveAccount } from '~/framework/modules/auth/model';
import { createRegistryEntry } from '~/framework/util/registry';

const homeSections = createRegistryEntry();

export const registerHomeSection = homeSections.register;

export const getVisibleHomeSections = (session: AuthActiveAccount) =>
  homeSections.getAll().filter(section => section.isVisible(session));
