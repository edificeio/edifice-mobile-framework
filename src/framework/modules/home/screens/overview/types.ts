import type { MaterialTopTabScreenProps } from '@react-navigation/material-top-tabs';

import type { HomeTabsParamList } from '~/framework/modules/home/screens/home/types';

// The page navigates nowhere itself: every section carries its own routes.
export type HomeOverviewScreenProps = MaterialTopTabScreenProps<HomeTabsParamList, 'home/overview'>;
