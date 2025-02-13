import * as React from 'react';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import type { WikiHomeScreenPrivateProps } from './types';

import { I18n } from '~/app/i18n';
import MultilineTextInput from '~/framework/components/inputs/multiline';
import TextInput from '~/framework/components/inputs/text';
import { PageView } from '~/framework/components/page';
import { BodyBoldText } from '~/framework/components/text';
import { WikiNavigationParams, wikiRouteNames } from '~/framework/modules/wiki/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';

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
  const [v1, setV1] = React.useState<string>('');
  const [v2, setV2] = React.useState<string>('');
  return (
    <PageView>
      <BodyBoldText>wiki home screen</BodyBoldText>
      <TextInput maxLength={40} value={v1} onChangeText={setV1} />
      <MultilineTextInput maxLength={10000} numberOfLines={3} value={v2} onChangeText={setV2} />
    </PageView>
  );
}
