import { AuthPendingRedirection } from '~/framework/modules/auth/model';
import { Error } from '~/framework/util/error';
import { TRACK_ERROR, trackScenarios } from '~/framework/util/tracker/track-opt';

export const trackingScenarios = trackScenarios({
  'Connexion simple': {
    [AuthPendingRedirection.ACTIVATE]: ['Activation'],
    [AuthPendingRedirection.RENEW_PASSWORD]: ['Renouvellement'],
  },
  'Connexion auto': {},
  'Connexion fédérée': {
    [TRACK_ERROR]: e => {
      if (e instanceof Error.SamlMultipleVectorError) return ['Multiple', '', e.data.users.length];
      return undefined;
    },
  },
});
