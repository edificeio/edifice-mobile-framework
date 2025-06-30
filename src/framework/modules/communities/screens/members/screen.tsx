import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { I18n } from '~/app/i18n';
import * as React from 'react';

import { PageView } from '~/framework/components/page';
import { BodyBoldText } from '~/framework/components/text';
import { navBarOptions } from '~/framework/navigation/navBar';

import { CommunitiesNavigationParams, communitiesRouteNames } from '~/framework/modules/communities/navigation';
import styles from './styles';
import type { CommunitiesMembersScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<CommunitiesNavigationParams, typeof communitiesRouteNames.members>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('communities-members-title'),
  }),
});

export default function CommunitiesMembersScreen(props: CommunitiesMembersScreenPrivateProps) {
  return (
    <PageView>
      <BodyBoldText>communities members screen</BodyBoldText>
    </PageView>
  );
}
