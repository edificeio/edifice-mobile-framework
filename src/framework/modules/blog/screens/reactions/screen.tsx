import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';

import { I18n } from '~/app/i18n';
import AudienceMeasurementReactionsModal from '~/framework/components/audience-measurement/modal-reactions';
import { EmptyContentScreen } from '~/framework/components/empty-screens';
import { ContentLoader } from '~/framework/hooks/loader';
import { blogRouteNames } from '~/framework/modules/blog/navigation';
import { audienceService } from '~/framework/modules/core/audience/service';
import { AudienceReactions } from '~/framework/modules/core/audience/types';
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
  const { blogPostId } = props.route.params;

  const [data, setData] = React.useState<AudienceReactions | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      const dt = (await audienceService.reaction.getDetails(
        {
          module: 'blog',
          resourceType: 'post',
          resourceId: blogPostId,
        },
        1,
        20,
      )) as AudienceReactions;
      setData(dt);
    } catch (e) {
      console.log('[BlogReactionsScreen] error :', e);
    }
  }, [blogPostId]);

  // TODO - add placeholder ?
  return (
    <ContentLoader
      loadContent={loadData}
      renderContent={() => (
        <AudienceMeasurementReactionsModal
          allReactionsCounter={data?.reactionCounters.allReactionsCounter!}
          countByType={data?.reactionCounters.countByType!}
          userReactions={data?.userReactions!}
        />
      )}
      renderError={() => <EmptyContentScreen />}
    />
  );
}

export default BlogReactionsScreen;
