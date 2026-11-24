/**
 * Choice of the blog where to create a post (workflow of `timeline`, see `timeline-workflow.ts`).
 */
import * as React from 'react';

import type { StaticScreenProps } from '@react-navigation/native';

import { defineScreen, useNavigation } from '~/app/navigation-new';
import { EmptyScreen } from '~/framework/components/empty-screens';
import ResourcePicker from '~/framework/components/explorer/resource-picker';
import { loadPublishableBlogs } from '~/framework/modules/blog/actions';
import type { Blog, BlogList } from '~/framework/modules/blog/model';
import { getBlogWorkflowInformation } from '~/framework/modules/blog/model/business';
import { withSession } from '~/modules/auth/hoc';
import { useModuleAppDisplay } from '~/modules/myapps/hooks';
import { I18n } from '~/util/i18n';

type BlogSelectScreenNavParams = {
  blogsData: BlogList;
};

const BlogSelectScreen = withSession<StaticScreenProps<BlogSelectScreenNavParams>>(function ({ route, session }) {
  const appTheme = useModuleAppDisplay('blog');
  const navigation = useNavigation();
  const [blogsData, setBlogsData] = React.useState<BlogList>(route.params.blogsData);
  const hasBlogCreationRights = React.useMemo(() => getBlogWorkflowInformation(session).blog.create, [session]);

  const doGetPublishableBlogList = React.useCallback(async () => {
    // Throws if it fails: the picker handles it
    setBlogsData(await loadPublishableBlogs(session));
  }, [session]);

  const onPressBlog = React.useCallback((blog: Blog) => navigation.navigate('blog/create-post', { blog }), [navigation]);

  const renderEmptyBlogList = React.useCallback(
    () => (
      <EmptyScreen
        svgImage="empty-search"
        title={I18n.get('blog-select-emptyscreen-title')}
        text={I18n.get(hasBlogCreationRights ? 'blog-select-emptyscreen-text' : 'blog-select-emptyscreen-text-nocreationrights')}
        buttonText={hasBlogCreationRights ? I18n.get('blog-select-emptyscreen-button') : undefined}
        buttonUrl="/blog#/edit/new"
      />
    ),
    [hasBlogCreationRights],
  );

  const defaultThumbnail = React.useMemo(
    () => ({ background: appTheme.colors.pale, fill: appTheme.colors.regular, name: 'blog' }),
    [appTheme.colors.pale, appTheme.colors.regular],
  );

  return (
    <ResourcePicker
      data={blogsData}
      emptyComponent={renderEmptyBlogList}
      onRefresh={doGetPublishableBlogList}
      onPressItem={onPressBlog}
      defaultThumbnail={defaultThumbnail}
    />
  );
});
BlogSelectScreen.displayName = 'BlogSelectScreen';

export default defineScreen({
  options: () => ({ title: I18n.get('blog-select-title') }),
  screen: BlogSelectScreen,
});
