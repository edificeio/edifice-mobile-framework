import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AuthLoggedAccount } from '~/framework/modules/auth/model';
import type { PresencesNavigationParams, presencesRouteNames } from '~/framework/modules/viescolaire/presences/navigation';

export interface PresencesDeclareAbsenceScreenProps {}

export interface PresencesDeclareAbsenceScreenNavParams {
  childId: string;
}

export interface PresencesDeclareAbsenceScreenStoreProps {
  session?: AuthLoggedAccount;
}

export interface PresencesDeclareAbsenceScreenDispatchProps {}

export type PresencesDeclareAbsenceScreenPrivateProps = PresencesDeclareAbsenceScreenProps &
  PresencesDeclareAbsenceScreenStoreProps &
  PresencesDeclareAbsenceScreenDispatchProps &
  NativeStackScreenProps<PresencesNavigationParams, typeof presencesRouteNames.declareAbsence>;
