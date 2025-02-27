import * as React from 'react';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import type { WikiHomeScreenPrivateProps } from './types';

import { I18n } from '~/app/i18n';
import { BodyBoldText } from '~/framework/components/text';
import ImageInput from '~/framework/modules/wiki/components/image-input';
import moduleConfig from '~/framework/modules/wiki/module-config';
import { WikiNavigationParams, wikiRouteNames } from '~/framework/modules/wiki/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';
import { Asset } from '~/framework/util/fileHandler/types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<WikiNavigationParams, typeof wikiRouteNames.home>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('wiki-home-title'),
  }),
});

export default function WikiHomeScreen(props: WikiHomeScreenPrivateProps) {
  const [imageUrl, setImageUrl] = React.useState<Pick<Asset, 'uri'> | undefined>(undefined);

  return (
    <>
      <BodyBoldText>wiki home screen</BodyBoldText>
      <ImageInput moduleConfig={moduleConfig} value={imageUrl} onChange={setImageUrl} />
    </>
  );
}
