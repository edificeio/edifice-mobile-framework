import * as React from 'react';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import type { WikiReaderScreen } from './types';

import { I18n } from '~/app/i18n';
import { PageView } from '~/framework/components/page';
import { BodyBoldText } from '~/framework/components/text';
import { WikiNavigationParams, wikiRouteNames } from '~/framework/modules/wiki/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<WikiNavigationParams, typeof wikiRouteNames.reader>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('wiki-reader-title'),
  }),
});

export default function WikiReaderScreen(props: WikiReaderScreen.AllProps) {
  return (
    <PageView>
      <BodyBoldText>wiki reader screen</BodyBoldText>
    </PageView>
  );
}
