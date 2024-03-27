import { AuthPendingRedirection } from '~/framework/modules/auth/model';
import { Error } from '~/framework/util/error';
import { Trackers, trackingActionAddSuffix } from '~/framework/util/tracker';
import { TRACK_DEFAULT, TRACK_ERROR, createTrackEvents, trackScenarios } from '~/framework/util/tracker/track-opt';

import moduleConfig from './module-config';

enum TrackCategory {
  Authentification = 'Authentification',
  Compte = 'Compte',
}

export default createTrackEvents({
  loginCredentials: {
    [TRACK_DEFAULT]: [TrackCategory.Authentification, 'Connexion simple'],
    [AuthPendingRedirection.ACTIVATE]: [TrackCategory.Authentification, ['Activation', 'Init']],
    [AuthPendingRedirection.RENEW_PASSWORD]: [TrackCategory.Authentification, ['Renouvellement', 'Init']],
  },
});

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
  Activation: {},
  Renouvellement: {},
});

export const trackingWayfEvents = {
  loadSuccess: (url: string) => {
    Trackers.trackEventOfModule(moduleConfig, trackingActionAddSuffix('Affichage WAYF', true), url);
  },
  loadError: (url: string, code?: number) => {
    Trackers.trackEventOfModule(moduleConfig, trackingActionAddSuffix('Affichage WAYF', false), url, code);
  },
};
