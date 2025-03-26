import * as React from 'react';

import { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import type { WikiCreateScreen } from './types';

import ImageInput from '~/framework/modules/wiki/components/image-input';
import moduleConfig from '~/framework/modules/wiki/module-config';
import { WikiNavigationParams, wikiRouteNames } from '~/framework/modules/wiki/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';
import { Asset } from '~/framework/util/fileHandler/types';

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
  const [imageUrl, setImageUrl] = React.useState<Pick<Asset, 'uri'> | undefined>(undefined);

  return (
    <>
      <ImageInput moduleConfig={moduleConfig} value={imageUrl} onChange={setImageUrl} />
    </>
  );
}
