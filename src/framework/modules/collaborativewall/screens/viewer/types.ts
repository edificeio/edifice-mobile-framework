import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { CollaborativewallNavigationParams } from '~/framework/modules/collaborativewall/navigation';
import { CollaborativewallIdentifier } from '~/framework/modules/collaborativewall/service';

export interface CollaborativewallViewerScreenProps {
  // @scaffolder add props here
}

export interface CollaborativewallViewerScreenNavParams {
  id: CollaborativewallIdentifier;
}

export interface CollaborativewallViewerScreenPrivateProps
  extends NativeStackScreenProps<CollaborativewallNavigationParams, 'viewer'>,
    CollaborativewallViewerScreenProps {
  // @scaffolder add HOC props here
}
