import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';

import { I18n } from '~/app/i18n';
import AudienceMeasurementReactionsModal from '~/framework/components/audience-measurement/modal-reactions';
import { blogRouteNames } from '~/framework/modules/blog/navigation';
import { UserNavigationParams } from '~/framework/modules/user/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';

import { BlogReactionsScreenProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<UserNavigationParams, typeof blogRouteNames.blogReactions>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('blog-reactions-title'),
  }),
});

function BlogReactionsScreen(props: BlogReactionsScreenProps) {
  return <AudienceMeasurementReactionsModal />;
}

export default BlogReactionsScreen;
