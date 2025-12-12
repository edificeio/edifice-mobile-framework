/**
 * Blog post list
 */
import React from 'react';
import { ListRenderItemInfo } from 'react-native';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';

import { styles } from './styles';
import { BlogPostListScreenProps } from './types';

import { I18n } from '~/app/i18n';
import { EmptyScreen } from '~/framework/components/empty-screens';
import { PaginatedFlatList, PaginatedFlatListProps } from '~/framework/components/list/paginated-list';
import NavBarAction from '~/framework/components/navigation/navbar-action';
import { sessionScreen } from '~/framework/components/screen';
import { ContentLoader } from '~/framework/hooks/loader';
import { audienceService } from '~/framework/modules/audience/service';
import { AuthActiveAccount } from '~/framework/modules/auth/model';
import BlogPlaceholderList from '~/framework/modules/blog/components/placeholder/list';
import { BlogPostPlaceholder } from '~/framework/modules/blog/components/placeholder/list/component';
import BlogPostResourceCard from '~/framework/modules/blog/components/post-resource-card';
import moduleConfig from '~/framework/modules/blog/module-config';
import { BlogNavigationParams, blogRouteNames } from '~/framework/modules/blog/navigation';
import { actions, Blog, BlogPost, BlogPostWithAudience, countComments, selectors } from '~/framework/modules/blog/reducer';
import { getBlogPostRight, hasPermissionManager } from '~/framework/modules/blog/rights';
import { blogService } from '~/framework/modules/blog/service';
import { navBarOptions, navBarTitle } from '~/framework/navigation/navBar';

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

const BlogPostListItem = ({
  blog,
  isManager,
  item,
  navigation,
  session,
}: {
  session: AuthActiveAccount;
  isManager: boolean;
  blog: Blog;
  navigation: BlogPostListScreenProps['navigation'];
} & ListRenderItemInfo<BlogPostWithAudience>) => {
  const dateAsMoment = React.useMemo(() => moment(item.created), [item.created]);
  const totalComments = React.useMemo(() => countComments(item), [item]);
  const onOpen = React.useCallback(() => {
    navigation.navigate(blogRouteNames.blogPostDetails, {
      blog,
      blogPost: item,
    });
  }, [blog, item, navigation]);
  return (
    <BlogPostResourceCard
      action={onOpen}
      authorId={item.author.userId}
      authorName={item.author.username}
      comments={totalComments}
      contentHtml={item.content}
      date={dateAsMoment}
      title={item.title}
      state={item.state as 'PUBLISHED' | 'SUBMITTED'}
      resourceId={item._id}
      audience={item.audience}
      session={session}
      blogVisibility={blog.visibility}
      isManager={isManager}
    />
  );
};

const BlogPostListScreenLoaded = ({
  blogId,
  navigation,
  session,
}: Pick<BlogPostListScreenProps, 'navigation'> &
  Pick<BlogPostListScreenProps['route']['params'], 'blogId'> & { session: AuthActiveAccount }) => {
  const dispatch = useDispatch();
  const blog = useSelector(selectors.blog(blogId));
  const hasBlogPostCreationRights = session && blog && getBlogPostRight(blog, session)?.actionRight;
  const isManager = hasPermissionManager(blog, session);
  const data = useSelector(selectors.posts(blogId));

  const onGoToPostCreationScreen = React.useCallback(
    () =>
      navigation.navigate(blogRouteNames.blogCreatePost, {
        blog,
        referrer: `${moduleConfig.routeName}/posts`,
      }),
    [navigation, blog],
  );

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        hasBlogPostCreationRights ? (
          <NavBarAction
            icon="ui-plus"
            onPress={() => {
              onGoToPostCreationScreen();
            }}
          />
        ) : null,

      headerTitle: navBarTitle(blog.title ?? I18n.get('blog-appname')),
    });
  }, [blog.title, hasBlogPostCreationRights, navigation, onGoToPostCreationScreen]);

  const renderItem = React.useCallback<PaginatedFlatListProps<BlogPostWithAudience>['renderItem']>(
    info => <BlogPostListItem {...info} navigation={navigation} session={session} blog={blog} isManager={isManager} />,
    [blog, isManager, navigation, session],
  );

  const renderPlaceholderItem = React.useCallback<PaginatedFlatListProps<BlogPostWithAudience>['renderPlaceholderItem']>(() => {
    return <BlogPostPlaceholder />;
  }, []);

  const getAudienceForPosts = React.useCallback(async (newBlogPosts: BlogPost[]) => {
    try {
      const [viewsForPosts, reactionsForPosts] = await Promise.all([
        audienceService.view.getSummary(
          'blog',
          'post',
          newBlogPosts.map(p => p._id),
        ),
        audienceService.reaction.getSummary(
          'blog',
          'post',
          newBlogPosts.map(p => p._id),
        ),
      ]);
      return newBlogPosts.map(p => {
        const views = viewsForPosts[p._id];
        const reactions = reactionsForPosts.reactionsByResource[p._id];
        return {
          ...p,
          audience: {
            reactions: {
              total: reactions?.totalReactionsCounter ?? 0,
              types: reactions?.reactionTypes ?? [],
              userReaction: reactions?.userReaction ?? null,
            },
            views,
          },
        } as BlogPostWithAudience;
      });
    } catch (e) {
      console.error('[BlogPostListScreen] fetchAudience error :', e);
      throw e;
    }
  }, []);

  const onPageReached = React.useCallback<NonNullable<PaginatedFlatListProps<BlogPostWithAudience>['onPageReached']>>(
    async (page, reloadAll) => {
      const [posts, totals] = await Promise.all([
        blogService.posts.page(session, blogId, page, PAGE_SIZE, ['PUBLISHED', 'SUBMITTED']),
        blogService.posts.total(session, blogId),
      ]);
      const postsWithAudience = await getAudienceForPosts(posts);
      dispatch(
        actions.posts.page(blogId, page * PAGE_SIZE, postsWithAudience, totals.countPublished + totals.countSubmitted, reloadAll),
      );
    },
    [blogId, dispatch, getAudienceForPosts, session],
  );

  const keyExtractor = React.useCallback((item: BlogPostWithAudience) => item._id, []);

  const PAGE_SIZE = 20;

  const renderEmpty = React.useCallback(() => {
    return (
      <EmptyScreen
        svgImage="empty-blog"
        title={I18n.get(
          hasBlogPostCreationRights ? 'blog-postlist-emptyscreen-title' : 'blog-postlist-emptyscreen-title-nocreationrights',
        )}
        text={I18n.get(
          hasBlogPostCreationRights ? 'blog-postlist-emptyscreen-text' : 'blog-postlist-emptyscreen-text-nocreationrights',
        )}
        {...(hasBlogPostCreationRights
          ? {
              buttonAction: onGoToPostCreationScreen,
              buttonText: I18n.get('blog-postlist-emptyscreen-button'),
            }
          : {})}
      />
    );
  }, [hasBlogPostCreationRights, onGoToPostCreationScreen]);

  return (
    <PaginatedFlatList
      contentContainerStyle={styles.list}
      keyExtractor={keyExtractor}
      data={data}
      pageSize={PAGE_SIZE}
      renderItem={renderItem}
      renderPlaceholderItem={renderPlaceholderItem}
      onPageReached={onPageReached}
      ListEmptyComponent={renderEmpty}
    />
  );
};

export default sessionScreen<BlogPostListScreenProps>(function BlogPostListScreen({
  navigation,
  route: {
    params: { blogId },
  },
  session,
}) {
  const dispatch = useDispatch();
  const loadContent = React.useCallback(async () => {
    dispatch(actions.blog.load(await blogService.get(session, blogId)));
  }, [blogId, dispatch, session]);
  const renderContent = React.useCallback(
    () => <BlogPostListScreenLoaded navigation={navigation} blogId={blogId} session={session} />,
    [navigation, blogId, session],
  );
  return <ContentLoader renderContent={renderContent} loadContent={loadContent} renderLoading={BlogPlaceholderList} />;
});
