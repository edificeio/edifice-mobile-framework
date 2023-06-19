import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { ISession } from '~/framework/modules/auth/model';
import type { PresencesNavigationParams, presencesRouteNames } from '~/framework/modules/viescolaire/presences/navigation';

export interface PresencesDeclareAbsenceScreenProps {}

export interface PresencesDeclareAbsenceScreenNavParams {}

export interface PresencesDeclareAbsenceScreenStoreProps {
  childId?: string;
  childName?: string;
  session?: ISession;
  structureId?: string;
}

export interface PresencesDeclareAbsenceScreenDispatchProps {}

export type PresencesDeclareAbsenceScreenPrivateProps = PresencesDeclareAbsenceScreenProps &
  PresencesDeclareAbsenceScreenStoreProps &
  PresencesDeclareAbsenceScreenDispatchProps &
  NativeStackScreenProps<PresencesNavigationParams, typeof presencesRouteNames.declareAbsence>;
