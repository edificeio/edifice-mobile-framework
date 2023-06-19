/**
 * Blog post list
 */
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import moment from 'moment';
import React from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import { LoadingIndicator } from '~/framework/components/loading';
import NavBarAction from '~/framework/components/navigation/navbar-action';
import { PageView } from '~/framework/components/page';
import { ISession } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
import { BlogPostResourceCard } from '~/framework/modules/blog/components/BlogPostResourceCard';
import moduleConfig from '~/framework/modules/blog/module-config';
import { BlogNavigationParams, blogRouteNames } from '~/framework/modules/blog/navigation';
import { BlogPost, BlogPostList } from '~/framework/modules/blog/reducer';
import { getBlogPostRight } from '~/framework/modules/blog/rights';
import { blogService } from '~/framework/modules/blog/service';
import { navBarOptions, navBarTitle } from '~/framework/navigation/navBar';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

import { DisplayedBlog } from './BlogExplorerScreen';

export interface BlogPostListScreenDataProps {
  initialLoadingState: AsyncPagedLoadingState;
  session?: ISession;
}
export interface BlogPostListScreenEventProps {
  // doFetch: (selectedBlogId: string) => Promise<BlogPost[] | undefined>; // unused ?
}
export interface BlogPostListScreenNavigationParams {
  selectedBlog: DisplayedBlog;
}
export type BlogPostListScreenProps = BlogPostListScreenDataProps &
  BlogPostListScreenEventProps &
  NativeStackScreenProps<BlogNavigationParams, typeof blogRouteNames.blogPostList>;

const styles = StyleSheet.create({
  flexGrow1: {
    flexGrow: 1,
  },
});

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<BlogNavigationParams, typeof blogRouteNames.blogPostList>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('blog-appname'),
  }),
});

const BlogPostListScreen = (props: BlogPostListScreenProps) => {
  const selectedBlog = props.route.params.selectedBlog;
  const selectedBlogTitle = selectedBlog && selectedBlog.title;
  const selectedBlogId = selectedBlog && selectedBlog.id;
  const hasBlogPostCreationRights = props.session && selectedBlog && getBlogPostRight(selectedBlog, props.session)?.actionRight;
  const [blogPosts, setBlogPosts] = React.useState([] as BlogPostList);
  const [nextPageToFetchState, setNextPageToFetch] = React.useState(0);
  const [pagingSizeState, setPagingSize] = React.useState<number | undefined>(undefined);

  // ToDo : Make this in a useLoadingState.

  const [loadingState, setLoadingState] = React.useState(props.initialLoadingState ?? AsyncPagedLoadingState.PRISTINE);
  const loadingRef = React.useRef<AsyncPagedLoadingState>();
  loadingRef.current = loadingState;
  // /!\ Need to use Ref of the state because of hooks Closure issue. @see https://stackoverflow.com/a/56554056/6111343

  // Fetch a page of blog posts.
  // Auto-increment nextPageNumber unless `fromPage` is provided.
  // If `flushAfter` is also provided along `fromPage`, all content after the loaded page will be erased.
  /**
   * @throws Error
   */
  const fetchPage = async (blogId: string, fromPage?: number, flushAfter?: boolean) => {
    try {
      const pageToFetch = fromPage ?? nextPageToFetchState; // If page is not defined, automatically fetch the next page
      if (pageToFetch < 0) return; // Negatives values are used to tell end has been reached.
      const session = props.session;
      if (!session) throw new Error('BlogPostListScreen.fetchPage: no session');
      const newBlogPosts = await blogService.posts.page(session, blogId, pageToFetch, ['PUBLISHED', 'SUBMITTED']);
      let pagingSize = pagingSizeState;
      if (!pagingSize) {
        setPagingSize(newBlogPosts.length);
        pagingSize = newBlogPosts.length;
      }
      if (pagingSize) {
        if (newBlogPosts.length) {
          setBlogPosts([
            ...blogPosts.slice(0, pagingSize * pageToFetch),
            ...newBlogPosts,
            ...(flushAfter ? [] : blogPosts.slice(pagingSize * (pageToFetch + 1))),
          ]);
        }

        if (!fromPage) {
          setNextPageToFetch(newBlogPosts.length === 0 || newBlogPosts.length < pagingSize ? -1 : pageToFetch + 1);
        } else if (flushAfter) {
          setNextPageToFetch(fromPage + 1);
        }
        // Only increment pagecount when fromPage is not specified
      } else setBlogPosts([]);
    } catch {
      throw new Error();
    }
  };
  const fetchFromStart = async (blogId: string) => {
    return fetchPage(blogId, 0, true);
  };

  const init = (selectedBlog_Id: string) => {
    if (selectedBlog_Id) {
      setLoadingState(AsyncPagedLoadingState.INIT);
      fetchFromStart(selectedBlog_Id)
        .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
        .catch(() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED));
    }
  };

  const reload = (selectedBlog_Id: string) => {
    if (selectedBlog_Id) {
      setLoadingState(AsyncPagedLoadingState.RETRY);
      fetchFromStart(selectedBlog_Id)
        .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
        .catch(() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED));
    }
  };

  const refresh = (selectedBlog_Id: string) => {
    if (selectedBlog_Id) {
      setLoadingState(AsyncPagedLoadingState.REFRESH);
      fetchFromStart(selectedBlog_Id)
        .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
        .catch(() => setLoadingState(AsyncPagedLoadingState.REFRESH_FAILED));
    }
  };
  const refreshSilent = (selectedBlog_Id: string) => {
    if (selectedBlog_Id) {
      setLoadingState(AsyncPagedLoadingState.REFRESH_SILENT);
      fetchFromStart(selectedBlog_Id)
        .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
        .catch(() => setLoadingState(AsyncPagedLoadingState.REFRESH_FAILED));
    }
  };
  const fetchNextPage = (selectedBlog_Id: string) => {
    if (selectedBlog_Id) {
      setLoadingState(AsyncPagedLoadingState.FETCH_NEXT);
      fetchPage(selectedBlog_Id)
        .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
        .catch(() => setLoadingState(AsyncPagedLoadingState.FETCH_NEXT_FAILED));
    }
  };

  const onGoToPostCreationScreen = () =>
    props.navigation.navigate(blogRouteNames.blogCreatePost, {
      blog: selectedBlog,
      referrer: `${moduleConfig.routeName}/posts`,
    });

  const onOpenBlogPost = (item: BlogPost) => {
    props.navigation.navigate(blogRouteNames.blogPostDetails, {
      blogPost: item,
      blog: selectedBlog,
    });
  };

  React.useEffect(() => {
    const unsubscribe = props.navigation.addListener('focus', () => {
      if (loadingRef.current === AsyncPagedLoadingState.PRISTINE) init(selectedBlogId);
      else refreshSilent(selectedBlogId);
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.navigation]);

  React.useEffect(() => {
    const hasError =
      !selectedBlog || loadingState === AsyncPagedLoadingState.RETRY || loadingState === AsyncPagedLoadingState.INIT_FAILED;

    props.navigation.setOptions({
      headerTitle: navBarTitle(selectedBlogTitle ?? I18n.get('blog-appname')),
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () =>
        hasBlogPostCreationRights && !hasError ? (
          <NavBarAction
            icon="ui-plus"
            onPress={() => {
              onGoToPostCreationScreen();
            }}
          />
        ) : null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBlogTitle]);

  const renderEmpty = () => {
    return (
      <EmptyScreen
        svgImage="empty-blog"
        title={I18n.get(`blog-postlist-emptyscreen-title${hasBlogPostCreationRights ? '' : 'NoCreationRights'}`)}
        text={I18n.get(`blog-postlist-emptyscreen-text${hasBlogPostCreationRights ? '' : 'NoCreationRights'}`)}
        {...(hasBlogPostCreationRights
          ? {
              buttonText: I18n.get('blog-postlist-emptyscreen-button'),
              buttonAction: onGoToPostCreationScreen,
            }
          : {})}
      />
    );
  };

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
        contentContainerStyle={styles.flexGrow1}
        scrollIndicatorInsets={{ right: 0.001 }} // 🍎 Hack to guarantee scrollbar to be stick on the right edge of the screen.
        onEndReached={() => {
          fetchNextPage(selectedBlogId);
        }}
        onEndReachedThreshold={0.5}
      />
    );
  };

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
      <PageView>{renderPage()}</PageView>
    </>
  );
};

const BlogPostListScreenConnected = connect((gs: IGlobalState) => {
  return {
    session: getSession(),
    initialLoadingState: AsyncPagedLoadingState.PRISTINE,
  };
})(BlogPostListScreen);
export default BlogPostListScreenConnected;
