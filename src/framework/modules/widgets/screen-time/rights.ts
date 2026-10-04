import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { timelineWidgets } from '~/framework/util/timelineWorkflows';

import moduleConfig from './module-config';

export const canSeeScreenTimeWidget = (session: AuthActiveAccount) =>
  timelineWidgets
    .get()
    .filterAvailables(session)
    .some(module => module.config.name === moduleConfig.name);
