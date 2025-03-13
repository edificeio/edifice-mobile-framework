import * as React from 'react';

import { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import { ResourceThumbnail } from '../../components/resource-thumbnail';
import type { WikiCreateScreen } from './types';

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
