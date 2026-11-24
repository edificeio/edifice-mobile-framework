/**
 * Blog post list
 */
import React from 'react';
import { ListRenderItemInfo } from 'react-native';

import type { StaticScreenProps } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import { defineScreen, headerAction, headerRightActions, useNavigation } from '~/app/navigation-new';
import { EmptyScreen } from '~/framework/components/empty-screens';
import { PaginatedFlatList, PaginatedFlatListProps } from '~/framework/components/list/paginated-list';
import { ContentLoader } from '~/framework/hooks/loader';
import { loadBlog, loadPostsPage } from '~/framework/modules/blog/actions';
import BlogPlaceholderList from '~/framework/modules/blog/components/placeholder/list';
import { BlogPostPlaceholder } from '~/framework/modules/blog/components/placeholder/list/component';
import BlogPostResourceCard from '~/framework/modules/blog/components/post-resource-card';
import type { Blog, BlogPostWithAudience } from '~/framework/modules/blog/model';
import { countComments, getBlogPostRight, hasPermissionManager } from '~/framework/modules/blog/model/business';
import { BlogDispatch, selectBlog, selectPosts } from '~/framework/modules/blog/store';
import { withSession } from '~/modules/auth/hoc';
import type { AuthActiveAccount } from '~/modules/auth/model';
import { I18n } from '~/util/i18n';

import { styles } from './styles';
import { BlogPostListScreenNavigationParams } from './types';

const PAGE_SIZE = 20;

const keyExtractor = (item: BlogPostWithAudience) => item._id;

const renderPlaceholderItem = () => <BlogPostPlaceholder />;

const BlogPostListItem = React.memo(function BlogPostListItemComponent({
  blog,
  isManager,
  item,
  session,
}: {
  session: AuthActiveAccount;
  isManager: boolean;
  blog: Blog;
} & Pick<ListRenderItemInfo<BlogPostWithAudience>, 'item'>) {
  const navigation = useNavigation();
  const totalComments = React.useMemo(() => countComments(item), [item]);
  const onOpen = React.useCallback(() => {
    navigation.navigate('blog/blog-post-details', {
      blogId: blog.id,
      postId: item._id,
    });
  }, [blog.id, item._id, navigation]);
  return (
    <BlogPostResourceCard
      action={onOpen}
      authorId={item.author.userId}
      authorName={item.author.username}
      comments={totalComments}
      contentHtml={item.content}
      date={item.created}
      pinned={item.pinned}
      title={item.title}
      state={item.state as 'PUBLISHED' | 'SUBMITTED'}
      resourceId={item._id}
      audience={item.audience}
      session={session}
      blogVisibility={blog.visibility}
      isManager={isManager}
    />
  );
});

const BlogPostListScreenLoaded = ({
  blogId,
  route,
  session,
}: Pick<StaticScreenProps<BlogPostListScreenNavigationParams>, 'route'> &
  Pick<BlogPostListScreenNavigationParams, 'blogId'> & { session: AuthActiveAccount }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch<BlogDispatch>();
  const blog = useSelector(selectBlog(blogId));
  const hasBlogPostCreationRights = React.useMemo(() => !!getBlogPostRight(blog, session)?.actionRight, [blog, session]);
  const isManager = React.useMemo(() => hasPermissionManager(blog, session), [blog, session]);
  const data = useSelector(selectPosts(blogId));

  const onGoToPostCreationScreen = React.useCallback(
    () => navigation.navigate('blog/create-post', { blog, referrer: 'blog/list' }),
    [navigation, blog],
  );

  // The title is the one of the blog, and the button depends on the rights on it: both are set once the blog is loaded
  React.useLayoutEffect(() => {
    navigation.setOptions({
      ...(hasBlogPostCreationRights
        ? headerRightActions(
            headerAction({
              icon: 'ui-plus',
              label: I18n.get('blog-createpost-title'),
              onPress: onGoToPostCreationScreen,
              testID: 'header-post-create',
            }),
          )
        : headerRightActions()),
      title: blog.title ?? I18n.get('blog-appname'),
    });
  }, [blog.title, hasBlogPostCreationRights, navigation, onGoToPostCreationScreen]);

  const renderItem = React.useCallback<PaginatedFlatListProps<BlogPostWithAudience>['renderItem']>(
    ({ item }) => <BlogPostListItem item={item} session={session} blog={blog} isManager={isManager} />,
    [blog, isManager, session],
  );

  const onPageReached = React.useCallback<NonNullable<PaginatedFlatListProps<BlogPostWithAudience>['onPageReached']>>(
    (page, reloadAll) => dispatch(loadPostsPage(session, blogId, page, PAGE_SIZE, !!reloadAll)),
    [blogId, dispatch, session],
  );

  const onFlushPosts = React.useCallback(() => onPageReached(0, true), [onPageReached]);

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

  React.useEffect(() => {
    if (route.params.forceReload) {
      onFlushPosts().catch(e => console.error('[BlogPostListScreen] reload error :', e));
      navigation.setParams({ forceReload: false });
    }
  }, [navigation, onFlushPosts, route.params.forceReload]);

  return (
    <PaginatedFlatList<BlogPostWithAudience>
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

const BlogPostListScreen = withSession<StaticScreenProps<BlogPostListScreenNavigationParams>>(function ({
  route: {
    params: { blogId },
  },
  route,
  session,
}) {
  const dispatch = useDispatch<BlogDispatch>();
  const loadContent = React.useCallback(() => dispatch(loadBlog(session, blogId)), [blogId, dispatch, session]);
  const renderContent = React.useCallback(
    () => <BlogPostListScreenLoaded blogId={blogId} session={session} route={route} />,
    [blogId, session, route],
  );
  return <ContentLoader renderContent={renderContent} loadContent={loadContent} renderLoading={BlogPlaceholderList} />;
});
BlogPostListScreen.displayName = 'BlogPostListScreen';

export default defineScreen({
  options: () => ({ title: I18n.get('blog-appname') }),
  screen: BlogPostListScreen,
});
