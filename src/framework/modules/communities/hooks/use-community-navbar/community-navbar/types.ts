import { ViewProps } from 'react-native';

import type { CommunitiesHomeScreen } from '~/framework/modules/communities/screens/home';

export interface CommunityNavbarProps {
  image?: CommunitiesHomeScreen.AllPropsLoaded['image'];
  style?: ViewProps['style'];
}
