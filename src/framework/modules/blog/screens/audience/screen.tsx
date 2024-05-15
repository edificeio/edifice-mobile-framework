import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';

import { I18n } from '~/app/i18n';
import AudienceMeasurementViewsModal from '~/framework/components/audience-measurement/modal-views';
import { blogRouteNames } from '~/framework/modules/blog/navigation';
import { UserNavigationParams } from '~/framework/modules/user/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';

import { BlogAudienceScreenProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<UserNavigationParams, typeof blogRouteNames.blogAudience>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('blog-audience-title'),
  }),
});

function BlogAudienceScreen(props: BlogAudienceScreenProps) {
  return <AudienceMeasurementViewsModal />;
}

export default BlogAudienceScreen;
