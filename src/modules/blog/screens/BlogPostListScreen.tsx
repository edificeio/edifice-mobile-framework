/**
 * Blog post list
 */
import I18n from 'i18n-js';
import moment from 'moment';
import React from 'react';
import { FlatList, RefreshControl, ScrollView, View } from 'react-native';
import { NavigationEventSubscription, NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { IGlobalState } from '~/AppStore';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import { DEPRECATED_HeaderPrimaryAction, HeaderTitleAndSubtitle } from '~/framework/components/header';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import { computeRelativePath } from '~/framework/util/navigation';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';
import { IUserSession, getUserSession } from '~/framework/util/session';
import { BlogPostResourceCard } from '~/modules/blog/components/BlogPostResourceCard';
import moduleConfig from '~/modules/blog/moduleConfig';
import { IBlogPost, IBlogPostList } from '~/modules/blog/reducer';
import { getBlogPostRight } from '~/modules/blog/rights';
import { blogService } from '~/modules/blog/service';

import { IDisplayedBlog } from './BlogExplorerScreen';

// TYPES ==========================================================================================

export interface IBlogPostListScreen_DataProps {
  initialLoadingState: AsyncPagedLoadingState;
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
  const hasBlogPostCreationRights = selectedBlog && getBlogPostRight(selectedBlog, props.session)?.actionRight;
  let focusEventListener: NavigationEventSubscription;

  // LOADER =====================================================================================

  // ToDo : Make this in a useLoadingState or <ContentLoader/>.

  const [loadingState, setLoadingState] = React.useState(props.initialLoadingState ?? AsyncPagedLoadingState.PRISTINE);
  const loadingRef = React.useRef<AsyncPagedLoadingState>();
  loadingRef.current = loadingState;
  // /!\ Need to use Ref of the state because of hooks Closure issue. @see https://stackoverflow.com/a/56554056/6111343

  React.useEffect(() => {
    focusEventListener = props.navigation.addListener('didFocus', () => {
      if (loadingRef.current === AsyncPagedLoadingState.PRISTINE) init(selectedBlogId);
      else refreshSilent(selectedBlogId);
    });
    return () => {
      focusEventListener.remove();
    };
  }, []);

  const init = (selectedBlogId: string) => {
    if (selectedBlogId) {
      setLoadingState(AsyncPagedLoadingState.INIT);
      fetchFromStart(selectedBlogId)
        .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
        .catch(() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED));
    }
  };

  const reload = (selectedBlogId: string) => {
    if (selectedBlogId) {
      setLoadingState(AsyncPagedLoadingState.RETRY);
      fetchFromStart(selectedBlogId)
        .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
        .catch(() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED));
    }
  };

  const refresh = (selectedBlogId: string) => {
    if (selectedBlogId) {
      setLoadingState(AsyncPagedLoadingState.REFRESH);
      fetchFromStart(selectedBlogId)
        .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
        .catch(() => setLoadingState(AsyncPagedLoadingState.REFRESH_FAILED));
    }
  };
  const refreshSilent = (selectedBlogId: string) => {
    if (selectedBlogId) {
      setLoadingState(AsyncPagedLoadingState.REFRESH_SILENT);
      fetchFromStart(selectedBlogId)
        .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
        .catch(() => setLoadingState(AsyncPagedLoadingState.REFRESH_FAILED));
    }
  };
  const fetchNextPage = (selectedBlogId: string) => {
    if (selectedBlogId) {
      setLoadingState(AsyncPagedLoadingState.FETCH_NEXT);
      fetchPage(selectedBlogId)
        .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
        .catch(() => setLoadingState(AsyncPagedLoadingState.FETCH_NEXT_FAILED));
    }
  };

  // EVENTS =====================================================================================

  const [blogPosts, setBlogPosts] = React.useState([] as IBlogPostList);
  const [nextPageToFetch_state, setNextPageToFetch] = React.useState(0);
  const [pagingSize_state, setPagingSize] = React.useState<number | undefined>(undefined);

  // Fetch all blog posts in a row
  const fetchBlogPosts = async (blogId: string) => {
    try {
      const session = props.session;
      const newBlogPosts = await blogService.posts.get(session, blogId, ['PUBLISHED', 'SUBMITTED']);
      setBlogPosts(newBlogPosts);
    } catch (e) {
      throw e;
    }
  };

  // Fetch a page of blog posts.
  // Auto-increment nextPageNumber unless `fromPage` is provided.
  // If `flushAfter` is also provided along `fromPage`, all content after the loaded page will be erased.
  const fetchPage = async (blogId: string, fromPage?: number, flushAfter?: boolean) => {
    try {
      const pageToFetch = fromPage ?? nextPageToFetch_state; // If page is not defined, automatically fetch the next page
      if (pageToFetch < 0) return; // Negatives values are used to tell end has been reached.
      const session = props.session;
      const newBlogPosts = await blogService.posts.page(session, blogId, pageToFetch, ['PUBLISHED', 'SUBMITTED']);
      let pagingSize = pagingSize_state;
      if (!pagingSize) {
        setPagingSize(newBlogPosts.length);
        pagingSize = newBlogPosts.length;
      }
      if (pagingSize) {
        newBlogPosts.length &&
          setBlogPosts([
            ...blogPosts.slice(0, pagingSize * pageToFetch),
            ...newBlogPosts,
            ...(flushAfter ? [] : blogPosts.slice(pagingSize * (pageToFetch + 1))),
          ]);

        if (!fromPage) {
          setNextPageToFetch(newBlogPosts.length === 0 || newBlogPosts.length < pagingSize ? -1 : pageToFetch + 1);
        } else if (flushAfter) {
          setNextPageToFetch(fromPage + 1);
        }
        // Only increment pagecount when fromPage is not specified
      } else setBlogPosts([]);
    } catch (e) {
      throw e;
    }
  };
  const fetchFromStart = async (blogId: string) => {
    return fetchPage(blogId, 0, true);
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

  const navBarInfo = {
    title: selectedBlogTitle ? (
      <HeaderTitleAndSubtitle title={selectedBlogTitle} subtitle={I18n.t('blog.appName')} />
    ) : (
      I18n.t('blog.appName')
    ),
  };

  // CREATE BUTTON ================================================================================

  const renderCreateButton = () => {
    const hasError =
      !selectedBlog || loadingState === AsyncPagedLoadingState.RETRY || loadingState === AsyncPagedLoadingState.INIT_FAILED;
    return hasBlogPostCreationRights && !hasError ? (
      <DEPRECATED_HeaderPrimaryAction
        iconName="new_post"
        onPress={() => {
          onGoToPostCreationScreen();
        }}
      />
    ) : null;
  };

  // EMPTY SCREEN =================================================================================

  const renderEmpty = () => {
    return (
      <EmptyScreen
        svgImage="empty-blog"
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
          <RefreshControl refreshing={loadingState === AsyncPagedLoadingState.RETRY} onRefresh={() => reload(selectedBlogId)} />
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
        ListHeaderComponent={<View style={{ height: UI_SIZES.spacing.medium }} />}
        ListFooterComponent={
          <>
            {loadingState === AsyncPagedLoadingState.FETCH_NEXT ? <LoadingIndicator withVerticalMargins /> : null}
            <View style={{ paddingBottom: UI_SIZES.screen.bottomInset }} />
          </>
        }
        refreshControl={
          <RefreshControl refreshing={loadingState === AsyncPagedLoadingState.REFRESH} onRefresh={() => refresh(selectedBlogId)} />
        }
        contentContainerStyle={{ flexGrow: 1 }}
        scrollIndicatorInsets={{ right: 0.001 }} // 🍎 Hack to guarantee scrollbar to be stick on the right edge of the screen.
        onEndReached={() => {
          fetchNextPage(selectedBlogId);
        }}
        onEndReachedThreshold={0.5}
      />
    );
  };

  // RENDER =======================================================================================

  const renderPage = () => {
    if (!selectedBlog) {
      return renderError();
    }
    switch (loadingState) {
      case AsyncPagedLoadingState.DONE:
      case AsyncPagedLoadingState.REFRESH:
      case AsyncPagedLoadingState.REFRESH_FAILED:
      case AsyncPagedLoadingState.REFRESH_SILENT:
      case AsyncPagedLoadingState.FETCH_NEXT:
      case AsyncPagedLoadingState.FETCH_NEXT_FAILED:
        return renderBlogPostList();
      case AsyncPagedLoadingState.PRISTINE:
      case AsyncPagedLoadingState.INIT:
        return <LoadingIndicator />;
      case AsyncPagedLoadingState.INIT_FAILED:
      case AsyncPagedLoadingState.RETRY:
        return renderError();
    }
  };

  return (
    <>
      <PageView navigation={props.navigation} navBarWithBack={navBarInfo} navBarNode={renderCreateButton()}>
        {renderPage()}
      </PageView>
    </>
  );
};

// MAPPING ========================================================================================

export default connect(
  (gs: IGlobalState) => {
    return {
      session: getUserSession(),
      initialLoadingState: AsyncPagedLoadingState.PRISTINE,
    };
  },
  dispatch => bindActionCreators({}, dispatch),
)(BlogPostListScreen);
