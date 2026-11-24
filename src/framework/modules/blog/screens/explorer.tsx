/**
 * Blog explorer
 */
import React from 'react';

import type { StaticScreenProps } from '@react-navigation/native';

import { defineScreen, useIsFocused, useNavigation } from '~/app/navigation-new';
import { EmptyScreen } from '~/framework/components/empty-screens';
import { getBlogWorkflowInformation } from '~/framework/modules/blog/model/business';
import ResourceExplorer, {
  explorerScreenHeader,
  ResourceExplorerTemplate,
} from '~/framework/modules/explorer/templates/resource-explorer';
import { withSession } from '~/modules/auth/hoc';
import { I18n } from '~/util/i18n';

// ToDo(blog-migration): the params of a route must be a `Record<string, unknown>`, which the `interface` of the template is not, and
// the template needs `route.name`, which `StaticScreenProps` doesn't give (later.md)
type BlogExplorerScreenProps = {
  route: StaticScreenProps<
    Pick<ResourceExplorerTemplate.NavParams, keyof ResourceExplorerTemplate.NavParams> | undefined
  >['route'] & { name: string };
};

const blogExplorerContext = {
  application: 'blog',
  resource_type: 'blog',
};

// # Screen

const BlogExplorerScreen = withSession<BlogExplorerScreenProps>(function ({ route, session }) {
  const navigation = useNavigation();
  const hasBlogCreationRights = getBlogWorkflowInformation(session) && getBlogWorkflowInformation(session).blog.create;

  const isFocused = useIsFocused();
  const onOpenResource = React.useCallback<NonNullable<ResourceExplorerTemplate.Props['onOpenResource']>>(
    r => {
      isFocused && navigation.navigate('blog/list', { blogId: r.resourceId });
    },
    [isFocused, navigation],
  );

  const emptyComponent = React.useMemo(() => {
    return (
      <EmptyScreen
        svgImage="empty-search"
        title={I18n.get('blog-explorer-emptyscreen-title')}
        text={I18n.get(
          hasBlogCreationRights ? 'blog-explorer-emptyscreen-text' : 'blog-explorer-emptyscreen-text-nocreationrights',
        )}
        buttonText={hasBlogCreationRights ? I18n.get('blog-explorer-emptyscreen-button') : undefined}
        buttonUrl="/blog#/edit/new"
      />
    );
  }, [hasBlogCreationRights]);

  return (
    <ResourceExplorer route={route} onOpenResource={onOpenResource} emptyComponent={emptyComponent} context={blogExplorerContext} />
  );
});
BlogExplorerScreen.displayName = 'BlogExplorerScreen';

export default defineScreen({
  options: explorerScreenHeader(blogExplorerContext, 'blog-appname'),
  screen: BlogExplorerScreen,
});
