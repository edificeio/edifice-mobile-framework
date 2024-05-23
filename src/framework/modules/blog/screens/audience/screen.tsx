import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';

import { I18n } from '~/app/i18n';
import AudienceMeasurementViewsModal from '~/framework/components/audience-measurement/modal-views';
import { EmptyContentScreen } from '~/framework/components/empty-screens';
import { ContentLoader } from '~/framework/hooks/loader';
import { blogRouteNames } from '~/framework/modules/blog/navigation';
import { audienceService } from '~/framework/modules/core/audience/service';
import { AudienceViews } from '~/framework/modules/core/audience/types';
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
  const { blogPostId } = props.route.params;

  const [data, setData] = React.useState<AudienceViews | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      const dt = await audienceService.view.getDetails({ module: 'blog', resourceType: 'post', resourceId: blogPostId });
      setData(dt);
    } catch (e) {
      console.error('[BlogAudienceScreen] error :', e);
    }
  }, [blogPostId]);

  // TODO LEA - add placeholder ?
  return (
    <ContentLoader
      loadContent={loadData}
      renderContent={() => (
        <AudienceMeasurementViewsModal
          nbUniqueViews={data?.uniqueViewsCounter!}
          nbViews={data?.viewsCounter!}
          viewsPerProfile={data?.uniqueViewsPerProfile!}
        />
      )}
      renderError={() => <EmptyContentScreen />}
    />
  );
}

export default BlogAudienceScreen;
