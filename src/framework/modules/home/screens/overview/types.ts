import type { MaterialTopTabScreenProps } from '@react-navigation/material-top-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { HomeTabsParamList } from '~/framework/modules/home/screens/home/types';
import type { NewsNavigationParams } from '~/framework/modules/news/navigation';

export type HomeOverviewScreenProps = CompositeScreenProps<
  MaterialTopTabScreenProps<HomeTabsParamList, 'home/overview'>,
  NativeStackScreenProps<NewsNavigationParams>
>;
