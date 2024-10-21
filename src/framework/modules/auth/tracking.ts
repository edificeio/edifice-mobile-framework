import { AuthPendingRedirection } from '~/framework/modules/auth/model';
import { Error } from '~/framework/util/error';
import { Trackers, trackingActionAddSuffix } from '~/framework/util/tracker';
import { createTrackEvents, TRACK_DEFAULT, TRACK_ERROR } from '~/framework/util/tracker/track-opt';

enum TrackCategory {
  Authentification = 'Authentification',
  Compte = 'Compte',
}

export default createTrackEvents({
  activation: {
    [TRACK_DEFAULT]: [TrackCategory.Authentification, 'Activation'],
  },
  addAccount: {
    [TRACK_DEFAULT]: [TrackCategory.Compte, 'Ajout de compte'],
  },
  loginCredentials: {
    [TRACK_DEFAULT]: [TrackCategory.Authentification, 'Connexion simple'],
    [AuthPendingRedirection.ACTIVATE]: [TrackCategory.Authentification, ['Activation', 'Init']],
    [AuthPendingRedirection.RENEW_PASSWORD]: [TrackCategory.Authentification, ['Renouvellement', 'Init']],
  },
  loginFederation: {
    [TRACK_DEFAULT]: [TrackCategory.Authentification, 'Connexion fédérée'],
    [TRACK_ERROR]: e => {
      if (e instanceof Error.SamlMultipleVectorError)
        return [TrackCategory.Authentification, ['Connexion fédérée', 'Multiple'], undefined, e.data.users.length];
      return undefined;
    },
  },
  loginRestore: {
    [TRACK_DEFAULT]: [TrackCategory.Authentification, 'Connexion auto'],
  },
  logout: {
    [TRACK_DEFAULT]: [TrackCategory.Compte, 'Déconnexion'],
  },
  passwordRenew: {
    [TRACK_DEFAULT]: [TrackCategory.Authentification, 'Renouvellement'],
  },
});

export const trackingWayfEvents = {
  loadError: (url: string, code?: number) => {
    Trackers.trackEvent(TrackCategory.Authentification, trackingActionAddSuffix('Affichage WAYF', false), url, code);
  },
  loadSuccess: (url: string) => {
    Trackers.trackEvent(TrackCategory.Authentification, trackingActionAddSuffix('Affichage WAYF', true), url);
  },
};

export const trackingAccountEvents = {
  deleteAccountFromManageAccounts: () => {
    Trackers.trackEvent(TrackCategory.Compte, 'Supprimer compte', 'Sélection compte → Gérer comptes → Supprimer compte');
  },
  deleteAccountFromSwitchAccount: () => {
    Trackers.trackEvent(TrackCategory.Compte, 'Supprimer compte', 'Mon compte → Changer compte → Supprimer compte');
  },
  manageAccountsPressButton: () => {
    Trackers.trackEvent(TrackCategory.Compte, 'Gérer comptes', 'Sélection compte → Gérer comptes');
  },
  switchAccountPressButton: () => {
    Trackers.trackEvent(TrackCategory.Compte, 'Changer compte', 'Mon compte → Changer compte');
  },
};
