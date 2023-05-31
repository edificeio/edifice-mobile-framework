import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ISession } from '~/framework/modules/auth/model';
import type { PresencesNavigationParams } from '~/framework/modules/viescolaire/presences/navigation';

export interface PresencesDeclareAbsenceScreenProps {
  childId?: string;
  childName?: string;
  session?: ISession;
  structureId?: string;
}

export interface PresencesDeclareAbsenceScreenNavParams {}

export interface PresencesDeclareAbsenceScreenPrivateProps
  extends NativeStackScreenProps<PresencesNavigationParams, 'declareAbsence'>,
    PresencesDeclareAbsenceScreenProps {
  // @scaffolder add HOC props here
}
