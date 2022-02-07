/**
 * Blog post list
 */

import I18n from 'i18n-js';
import moment from 'moment';
import React from 'react';
import { Platform, RefreshControl, View, ScrollView, FlatList } from 'react-native';
import { hasNotch } from 'react-native-device-info';
import { NavigationActions, NavigationEventSubscription, NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { IDisplayedBlog } from './BlogExplorerScreen';

import { IGlobalState } from '~/AppStore';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import {
  FakeHeader,
  HeaderAction,
  HeaderCenter,
  HeaderLeft,
  HeaderRow,
  HeaderSubtitle,
  HeaderTitle,
} from '~/framework/components/header';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import { ButtonIcon } from '~/framework/components/popupMenu';
import { AsyncLoadingState } from '~/framework/util/redux/async';
import { getUserSession, IUserSession } from '~/framework/util/session';
import { BlogPostResourceCard } from '~/modules/blog/components/BlogPostResourceCard';
import moduleConfig from '~/modules/blog/moduleConfig';
import { IBlogPost, IBlogPostList } from '~/modules/blog/reducer';
import { getBlogPostRight } from '~/modules/blog/rights';
import { blogService } from '~/modules/blog/service';
import { computeRelativePath } from '~/framework/util/navigation';

// TYPES ==========================================================================================

export interface IBlogPostListScreen_DataProps {
  initialLoadingState: AsyncLoadingState;
  session: IUserSession;
}
export interface IBlogPostListScreen_EventProps {
  doFetch: (selectedBlogId: string) => Promise<IBlogPost[] | undefined>;
}
export interface IBlogPostListScreen_NavigationParams {
  selectedBlog: IDisplayedBlog;
}
export type IBlogPostListScreen_Props = IBlogPostListScreen_DataProps &
  IBlogPostListScreen_EventProps &
  NavigationInjectedProps<IBlogPostListScreen_NavigationParams>;

// COMPONENT ======================================================================================

const BlogPostListScreen = (props: IBlogPostListScreen_Props) => {
  const selectedBlog = props.navigation.getParam('selectedBlog');
  const selectedBlogTitle = selectedBlog && selectedBlog.title;
  const selectedBlogId = selectedBlog && selectedBlog.id;
  const hasBlogPostCreationRights = getBlogPostRight(selectedBlog, props.session)?.actionRight;
  let focusEventListener: NavigationEventSubscription;

  // LOADER =====================================================================================

  // ToDo : Make this in a useLoadingState.

  const [loadingState, setLoadingState] = React.useState(props.initialLoadingState ?? AsyncLoadingState.PRISTINE);
  const loadingRef = React.useRef<AsyncLoadingState>();
  loadingRef.current = loadingState;
  // /!\ Need to use Ref of the state because of hooks Closure issue. @see https://stackoverflow.com/a/56554056/6111343

  React.useEffect(() => {
    focusEventListener = props.navigation.addListener('didFocus', () => {
      if (loadingRef.current === AsyncLoadingState.PRISTINE) init(selectedBlogId);
      else refreshSilent(selectedBlogId);
    });
    return () => {
      focusEventListener.remove();
    };
  }, []);

  const init = (selectedBlogId: string) => {
    if (selectedBlogId) {
      setLoadingState(AsyncLoadingState.INIT);
      fetchBlogPosts(selectedBlogId)
        .then(() => setLoadingState(AsyncLoadingState.DONE))
        .catch(() => setLoadingState(AsyncLoadingState.INIT_FAILED));
    }
  };

  const reload = (selectedBlogId: string) => {
    if (selectedBlogId) {
      setLoadingState(AsyncLoadingState.RETRY);
      fetchBlogPosts(selectedBlogId)
        .then(() => setLoadingState(AsyncLoadingState.DONE))
        .catch(() => setLoadingState(AsyncLoadingState.INIT_FAILED));
    }
  };

  const refresh = (selectedBlogId: string) => {
    if (selectedBlogId) {
      setLoadingState(AsyncLoadingState.REFRESH);
      fetchBlogPosts(selectedBlogId)
        .then(() => setLoadingState(AsyncLoadingState.DONE))
        .catch(() => setLoadingState(AsyncLoadingState.REFRESH_FAILED));
    }
  };
  const refreshSilent = (selectedBlogId: string) => {
    if (selectedBlogId) {
      setLoadingState(AsyncLoadingState.REFRESH_SILENT);
      fetchBlogPosts(selectedBlogId)
        .then(() => setLoadingState(AsyncLoadingState.DONE))
        .catch(() => setLoadingState(AsyncLoadingState.REFRESH_FAILED));
    }
  };

  // EVENTS =====================================================================================

  const [blogPosts, setBlogPosts] = React.useState([] as IBlogPostList);
  const fetchBlogPosts = async (blogId: string) => {
    try {
      const session = props.session;
      const blogPosts = await blogService.posts.get(session, blogId, ['PUBLISHED', 'SUBMITTED']);
      setBlogPosts(blogPosts);
    } catch (e) {
      throw e;
    }
  };

  const onGoToPostCreationScreen = () =>
    props.navigation.navigate(`${moduleConfig.routeName}/create`, {
      blog: selectedBlog,
      referrer: `${moduleConfig.routeName}/posts`,
    });

  const onOpenBlogPost = (item: IBlogPost) => {
    props.navigation.navigate(computeRelativePath(`${moduleConfig.routeName}/details`, props.navigation.state), {
      blogPost: item,
      blog: selectedBlog,
    });
  };

  // HEADER =====================================================================================

  const header = (
    <FakeHeader>
      <HeaderRow>
        <HeaderLeft>
          <HeaderAction
            iconName={Platform.OS === 'ios' ? 'chevron-left1' : 'back'}
            iconSize={24}
            onPress={() => props.navigation.dispatch(NavigationActions.back())}
          />
        </HeaderLeft>
        <HeaderCenter>
          {selectedBlogTitle ? (
            <>
              <HeaderTitle numberOfLines={1}>{selectedBlogTitle}</HeaderTitle>
              <HeaderSubtitle>{I18n.t('blog.appName')}</HeaderSubtitle>
            </>
          ) : (
            <HeaderTitle numberOfLines={2}>{I18n.t('blog.appName')}</HeaderTitle>
          )}
        </HeaderCenter>
      </HeaderRow>
    </FakeHeader>
  );

  // CREATE BUTTON ================================================================================

  const renderCreateButton = () => {
    return hasBlogPostCreationRights ? (
      <ButtonIcon
        name="new_post"
        onPress={() => {
          onGoToPostCreationScreen();
        }}
        style={{
          position: 'absolute',
          zIndex: 100,
          right: 20,
          top: Platform.select({ android: 14, ios: hasNotch() ? 61 : 34 }),
        }}
      />
    ) : null;
  };

  // EMPTY SCREEN =================================================================================

  const renderEmpty = () => {
    return (
      <EmptyScreen
        imageSrc={require('ASSETS/images/empty-screen/blog.png')}
        imgWidth={265.98}
        imgHeight={279.97}
        title={I18n.t(`blog.blogPostListScreen.emptyScreen.title${hasBlogPostCreationRights ? '' : 'NoCreationRights'}`)}
        text={I18n.t(`blog.blogPostListScreen.emptyScreen.text${hasBlogPostCreationRights ? '' : 'NoCreationRights'}`)}
        {...(hasBlogPostCreationRights
          ? {
              buttonText: I18n.t('blog.blogPostListScreen.emptyScreen.button'),
              buttonAction: onGoToPostCreationScreen,
            }
          : {})}
      />
    );
  };

  // ERROR ========================================================================================

  const renderError = () => {
    return (
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loadingState === AsyncLoadingState.RETRY} onRefresh={() => reload(selectedBlogId)} />
        }>
        <EmptyContentScreen />
      </ScrollView>
    );
  };

  // BLOG POST LIST ====================================================================================

  const renderBlogPostList = () => {
    return (
      <FlatList
        data={blogPosts}
        renderItem={({ item }) => {
          return (
            <BlogPostResourceCard
              action={() => onOpenBlogPost(item)}
              authorId={item.author.userId}
              authorName={item.author.username}
              comments={item.comments?.length as number}
              contentHtml={item.content}
              date={moment(item.created)}
              title={item.title}
              state={item.state as 'PUBLISHED' | 'SUBMITTED'}
            />
          );
        }}
        keyExtractor={item => item._id}
        ListEmptyComponent={renderEmpty()}
        ListHeaderComponent={hasBlogPostCreationRights ? <View style={{ height: 12 }} /> : null}
        ListFooterComponent={<View style={{ paddingBottom: UI_SIZES.bottomInset }} />}
        refreshControl={
          <RefreshControl refreshing={loadingState === AsyncLoadingState.REFRESH} onRefresh={() => refresh(selectedBlogId)} />
        }
        contentContainerStyle={{ flexGrow: 1 }}
        scrollIndicatorInsets={{ right: 0.001 }} // 🍎 Hack to guarantee scrollbar to be stick on the right edge of the screen.
      />
    );
  };

  // RENDER =======================================================================================

  const renderPage = () => {
    if (!selectedBlog) {
      return renderError();
    }
    switch (loadingState) {
      case AsyncLoadingState.DONE:
      case AsyncLoadingState.REFRESH:
      case AsyncLoadingState.REFRESH_FAILED:
      case AsyncLoadingState.REFRESH_SILENT:
        return renderBlogPostList();
      case AsyncLoadingState.PRISTINE:
      case AsyncLoadingState.INIT:
        return <LoadingIndicator />;
      case AsyncLoadingState.INIT_FAILED:
      case AsyncLoadingState.RETRY:
        return renderError();
    }
  };

  return (
    <>
      {header}
      {renderCreateButton()}
      <PageView path={props.navigation.state.routeName}>{renderPage()}</PageView>
    </>
  );
};

// MAPPING ========================================================================================

export default connect(
  (gs: IGlobalState) => {
    return {
      session: getUserSession(gs),
      initialLoadingState: AsyncLoadingState.PRISTINE,
    };
  },
  dispatch => bindActionCreators({}, dispatch),
)(BlogPostListScreen);
