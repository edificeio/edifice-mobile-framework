import * as React from 'react';
import { View } from 'react-native';

import { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import PageHeader from '../../components/page-header';
import { HeaderStatus } from '../../components/page-header/types';
import styles from './styles';
import type { WikiCreateScreen } from './types';

import { ResourceThumbnail } from '~/framework/modules/wiki/components/resource-thumbnail';
import { WikiNavigationParams, wikiRouteNames } from '~/framework/modules/wiki/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';

const picsum = { uri: 'https://picsum.photos/3000' };

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<WikiNavigationParams, typeof wikiRouteNames.create>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: '',
  }),
});

export default function WikiCreateScreen(props: WikiCreateScreen.AllProps) {
  return (
    <>
      <ResourceThumbnail source={picsum} />
    </>
  );
}
