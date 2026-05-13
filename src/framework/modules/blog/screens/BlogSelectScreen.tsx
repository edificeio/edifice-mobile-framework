import * as React from 'react';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import { EmptyScreen } from '~/framework/components/empty-screens';
import ResourcePicker from '~/framework/components/explorer/resource-picker';
import { getSession } from '~/framework/modules/auth/reducer';
import { getPublishableBlogListAction } from '~/framework/modules/blog/actions';
import { BlogNavigationParams, blogRouteNames } from '~/framework/modules/blog/navigation';
import { BlogList } from '~/framework/modules/blog/reducer';
import { getBlogWorkflowInformation } from '~/framework/modules/blog/rights';
import { useAppTheme } from '~/framework/modules/myapps/hooks';
import { navBarOptions } from '~/framework/navigation/navBar';

export interface BlogSelectScreenNavParams {
  blogsData: BlogList;
}
export type BlogSelectScreenProps = NativeStackScreenProps<BlogNavigationParams, typeof blogRouteNames.home>;

export interface BlogSelectScreenState {
  blogsData: BlogList;
}

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<BlogNavigationParams, typeof blogRouteNames.home>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('blog-select-title'),
  }),
});

function BlogSelectScreenComponent(props: BlogSelectScreenProps) {
  const appTheme = useAppTheme('blog');
  const dispatch = useDispatch() as any; // Thunk dispatch typing
  const session = useSelector((state: IGlobalState) => getSession());
  const [blogsData, setBlogsData] = React.useState<BlogList>(props.route.params.blogsData);

  const doGetPublishableBlogList = React.useCallback(async () => {
    const blogs = (await dispatch(getPublishableBlogListAction())) as unknown as BlogList;
    if (!blogs) {
      throw new Error('[doGetPublishableBlogList] failed to retrieve the publishable blog list');
    }
    setBlogsData(blogs);
  }, [dispatch]);

  const onPressBlog = (blog: any) => {
    props.navigation.navigate(blogRouteNames.blogCreatePost, { blog });
  };

  const renderEmptyBlogList = () => {
    const hasBlogCreationRights = session && getBlogWorkflowInformation(session)?.blog.create;
    return (
      <EmptyScreen
        svgImage="empty-search"
        title={I18n.get('blog-select-emptyscreen-title')}
        text={I18n.get(hasBlogCreationRights ? 'blog-select-emptyscreen-text' : 'blog-select-emptyscreen-text-nocreationrights')}
        buttonText={hasBlogCreationRights ? I18n.get('blog-select-emptyscreen-button') : undefined}
        buttonUrl="/blog#/edit/new"
      />
    );
  };

  return (
    <ResourcePicker
      data={blogsData}
      emptyComponent={renderEmptyBlogList}
      onRefresh={doGetPublishableBlogList}
      onPressItem={onPressBlog}
      defaultThumbnail={{
        background: appTheme.colors.pale,
        fill: appTheme.colors.regular,
        name: 'blog',
      }}
    />
  );
}

export const BlogSelectScreen = React.memo(BlogSelectScreenComponent);

export default BlogSelectScreen;
