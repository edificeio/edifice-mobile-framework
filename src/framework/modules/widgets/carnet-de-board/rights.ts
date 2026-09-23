import { AccountType, AuthActiveAccount } from '~/framework/modules/auth/model';
import { timelineWidgets } from '~/framework/modules/timeline/timeline-modules';

import moduleConfig from './module-config';

// the dashboard only ever speaks of a pupil, so only a pupil and their family are shown it
const READERS = new Set([AccountType.Student, AccountType.Relative]);

export const canSeeCarnetDeBordWidget = (session: AuthActiveAccount) =>
  READERS.has(session.user.type) &&
  timelineWidgets
    .get()
    .filterAvailables(session)
    .some(module => module.config.name === moduleConfig.name);
