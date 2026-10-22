/**
 * Blog selection, for a post about to be written.
 */
import React from 'react';

import { useIsFocused } from '@react-navigation/native';

import { I18n } from '~/app/i18n';
import { screenOptions } from '~/app/navigation/util';
import { EmptyScreen } from '~/framework/components/empty-screens';
import Toast from '~/framework/components/toast';
import { withSession } from '~/framework/modules/auth/util';
import moduleConfig from '~/framework/modules/blog/module-config';
import { blogRouteNames } from '~/framework/modules/blog/navigation';
import { dispatchBlogPostOnSuccessAction } from '~/framework/modules/blog/navigation/actions';
import { selectors } from '~/framework/modules/blog/reducer';
import { getBlogWorkflowInformation } from '~/framework/modules/blog/rights';
import { blogService } from '~/framework/modules/blog/service';
import { API } from '~/framework/modules/explorer/service/types';
import ResourceExplorer, { ResourceExplorerTemplate } from '~/framework/modules/explorer/templates/resource-explorer';

import type { BlogSelectScreenProps } from './types';

export const computeNavBar = screenOptions(() => ({
  title: I18n.get('blog-select-title'),
}));

// contrib is the right needed to post in a blog.
const blogSelectContext: API.Explorer.ContextQuery = {
  application: 'blog',
  resource_type: 'blog',
  right_type: 'contrib',
};

export default withSession<BlogSelectScreenProps>(({ navigation, route, session, ...props }) => {
  const hasBlogCreationRights = getBlogWorkflowInformation(session) && getBlogWorkflowInformation(session).blog.create;
  const isFocused = useIsFocused();

  // The creation screen needs the blog itself, which the explorer does not carry.
  const onOpenResource = React.useCallback<NonNullable<ResourceExplorerTemplate.Props['onOpenResource']>>(
    async r => {
      if (!isFocused) return;
      try {
        const blog = await blogService.get(session, r.resourceId);
        navigation.navigate(blogRouteNames.blogCreatePost, {
          blog,
          navActionOnSuccess: dispatchBlogPostOnSuccessAction(blog.id, session),
          source: route.params.source,
        });
      } catch {
        Toast.showError(I18n.get('toast-error-text'));
      }
    },
    [isFocused, navigation, route.params.source, session],
  );

  const emptyComponent = React.useMemo(
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

  return (
    <ResourceExplorer
      {...props}
      navigation={navigation as ResourceExplorerTemplate.NavigationProps['navigation']}
      route={route as ResourceExplorerTemplate.NavigationProps['route']}
      moduleConfig={moduleConfig}
      onOpenResource={onOpenResource}
      selectors={selectors.explorer}
      emptyComponent={emptyComponent}
      context={blogSelectContext}
    />
  );
});
