import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationState, SceneRendererProps } from 'react-native-tab-view';

import { AudienceReferer } from '~/framework/modules/audience/types';
import { IModalsNavigationParams, ModalsRouteNames } from '~/framework/navigation/modals';

export interface AudienceReactionsScreenDataProps {
  validReactionTypes: string[];
}
export interface AudienceReactionsScreenEventProps {}
export interface AudienceReactionsScreenNavParams {
  referer: AudienceReferer;
}
export type AudienceReactionsScreenProps = AudienceReactionsScreenDataProps &
  AudienceReactionsScreenEventProps &
  NativeStackScreenProps<IModalsNavigationParams, typeof ModalsRouteNames.AudienceReactions>;

export type ReactionsTabViewProps = SceneRendererProps & { navigationState: NavigationState<{ key: string }> };
