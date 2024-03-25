import { AuthPendingRedirection } from '~/framework/modules/auth/model';
import { TRACK_NAME, TrackValuesMap } from '~/framework/util/tracker/track-opt';

export const loginCredentialsTracking: TrackValuesMap = {
  [TRACK_NAME]: 'Connexion simple',
  [AuthPendingRedirection.ACTIVATE]: ['Activation'],
  [AuthPendingRedirection.RENEW_PASSWORD]: ['Renouvellement'],
};
