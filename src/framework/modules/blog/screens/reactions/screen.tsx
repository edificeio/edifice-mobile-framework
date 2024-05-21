import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import AudienceMeasurementReactionsModal from '~/framework/components/audience-measurement/modal-reactions';
import { EmptyContentScreen } from '~/framework/components/empty-screens';
import { ContentLoader } from '~/framework/hooks/loader';
import { getSession } from '~/framework/modules/auth/reducer';
import { getReactionsBlogPost } from '~/framework/modules/blog/actions';
import { blogRouteNames } from '~/framework/modules/blog/navigation';
import { AudienceReactions } from '~/framework/modules/core/audience/types';
import { UserNavigationParams } from '~/framework/modules/user/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';

import { BlogReactionsScreenDataProps, BlogReactionsScreenEventProps, BlogReactionsScreenProps } from './types';

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
  const { handleGetBlogPostReactions } = props;
  const { blogPostId } = props.route.params;

  const [data, setData] = React.useState<AudienceReactions | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      const dt = (await handleGetBlogPostReactions(blogPostId)) as AudienceReactions;
      setData(dt);
    } catch (e) {
      console.log('[BlogReactionsScreen] error :', e);
    }
  }, [blogPostId, handleGetBlogPostReactions]);

  // TODO - add placeholder ?
  return (
    <ContentLoader
      loadContent={loadData}
      renderContent={() => (
        <AudienceMeasurementReactionsModal
          allReactionsCounter={data?.allReactionsCounter!}
          countByType={data?.countByType!}
          userReactions={data?.userReactions!}
        />
      )}
      renderError={() => <EmptyContentScreen />}
    />
  );
}

const mapStateToProps: (s: IGlobalState) => BlogReactionsScreenDataProps = s => ({
  session: getSession()!,
});

const mapDispatchToProps: (
  dispatch: ThunkDispatch<any, any, any>,
  getState: () => IGlobalState,
) => BlogReactionsScreenEventProps = (dispatch, getState) => ({
  handleGetBlogPostReactions: async (blogPostId: string) => {
    return (await dispatch(getReactionsBlogPost(blogPostId))) as AudienceReactions;
  },
});

const BlogReactionsScreenConnected = connect(mapStateToProps, mapDispatchToProps)(BlogReactionsScreen);
export default BlogReactionsScreenConnected;
