import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { PresencesNavigationParams } from '~/framework/modules/viescolaire/presences/navigation';

export interface PresencesCallScreenProps {}

export interface PresencesCallScreenNavParams {}

export interface PresencesCallScreenPrivateProps
  extends NativeStackScreenProps<PresencesNavigationParams, 'call'>,
    PresencesCallScreenProps {
  // @scaffolder add HOC props here
}
