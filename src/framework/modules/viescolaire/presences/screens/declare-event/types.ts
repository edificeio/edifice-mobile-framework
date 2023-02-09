import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { PresencesNavigationParams } from '~/framework/modules/viescolaire/presences/navigation';

export interface PresencesDeclareEventScreenProps {
  declareLateness: any;
  updateLateness: any;
  declareLeaving: any;
  updateLeaving: any;
  deleteEvent: any;
}

export interface PresencesDeclareEventScreenNavParams {
  color: string;
  title: string;
  type: string;
}

export interface PresencesDeclareEventScreenPrivateProps
  extends NativeStackScreenProps<PresencesNavigationParams, 'declareEvent'>,
    PresencesDeclareEventScreenProps {
  // @scaffolder add HOC props here
}
