/**
 * Blog explorer
 */
import React from 'react';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import { selectors } from '../reducer';

import { I18n } from '~/app/i18n';
import { EmptyScreen } from '~/framework/components/empty-screens';
import { getSession } from '~/framework/modules/auth/reducer';
import moduleConfig from '~/framework/modules/blog/module-config';
import { BlogNavigationParams, blogRouteNames } from '~/framework/modules/blog/navigation';
import { getBlogWorkflowInformation } from '~/framework/modules/blog/rights';
import ResourceExplorer, { ResourceExplorerTemplate } from '~/framework/modules/explorer/templates/resource-explorer';
import { navBarOptions } from '~/framework/navigation/navBar';

export namespace BlogExplorerScreen {
  export interface NavParams extends ResourceExplorerTemplate.NavParams {}
  export type NavigationProps = NativeStackScreenProps<BlogNavigationParams, 'blogExplorer'>;
  export interface AllProps
    extends Omit<ResourceExplorerTemplate.ScreenProps, keyof ResourceExplorerTemplate.NavigationProps>,
      NavigationProps {}
}

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<BlogNavigationParams, typeof blogRouteNames.blogExplorer>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('blog-appname'),
  }),
});

const blogExplorerContext = {
  application: 'blog',
  resource_type: 'blog',
};

export default ({ navigation, route, ...props }: BlogExplorerScreen.AllProps) => {
  const session = getSession();
  const hasBlogCreationRights = session && getBlogWorkflowInformation(session) && getBlogWorkflowInformation(session).blog.create;

  const onOpenResource = React.useCallback<NonNullable<ResourceExplorerTemplate.Props['onOpenResource']>>(
    r => {
      navigation.navigate(blogRouteNames.blogPostList, { blogId: r.resourceEntId });
    },
    [navigation],
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
    <ResourceExplorer
      {...props}
      navigation={navigation as ResourceExplorerTemplate.NavigationProps['navigation']}
      route={route as ResourceExplorerTemplate.NavigationProps['route']}
      moduleConfig={moduleConfig}
      onOpenResource={onOpenResource}
      selectors={selectors.explorer}
      emptyComponent={emptyComponent}
      context={blogExplorerContext}
    />
  );
};
