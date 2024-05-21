import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import AudienceMeasurementViewsModal from '~/framework/components/audience-measurement/modal-views';
import { EmptyContentScreen } from '~/framework/components/empty-screens';
import { ContentLoader } from '~/framework/hooks/loader';
import { getSession } from '~/framework/modules/auth/reducer';
import { getViewsBlogPost } from '~/framework/modules/blog/actions';
import { blogRouteNames } from '~/framework/modules/blog/navigation';
import { AudienceViews } from '~/framework/modules/core/audience/types';
import { UserNavigationParams } from '~/framework/modules/user/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';

import { BlogAudienceScreenDataProps, BlogAudienceScreenEventProps, BlogAudienceScreenProps } from './types';

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
  const { handleGetBlogPostViews } = props;
  const { blogPostId } = props.route.params;

  const [data, setData] = React.useState<AudienceViews | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      const dt = await handleGetBlogPostViews(blogPostId);
      setData(dt);
    } catch (e) {
      console.error('[BlogAudienceScreen] error :', e);
    }
  }, [blogPostId, handleGetBlogPostViews]);

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

const mapStateToProps: (s: IGlobalState) => BlogAudienceScreenDataProps = s => ({
  session: getSession()!,
});

const mapDispatchToProps: (dispatch: ThunkDispatch<any, any, any>, getState: () => IGlobalState) => BlogAudienceScreenEventProps = (
  dispatch,
  getState,
) => ({
  handleGetBlogPostViews: async (blogPostId: string) => {
    return (await dispatch(getViewsBlogPost(blogPostId))) as AudienceViews;
  },
});

const BlogAudienceScreenConnected = connect(mapStateToProps, mapDispatchToProps)(BlogAudienceScreen);
export default BlogAudienceScreenConnected;
