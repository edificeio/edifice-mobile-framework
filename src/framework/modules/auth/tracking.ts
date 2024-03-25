import { AuthPendingRedirection } from '~/framework/modules/auth/model';
import { trackScenarios } from '~/framework/util/tracker/track-opt';

export const trackingScenarios = trackScenarios({
  'Connexion simple': {
    [AuthPendingRedirection.ACTIVATE]: ['Activation'],
    [AuthPendingRedirection.RENEW_PASSWORD]: ['Renouvellement'],
  },
});
