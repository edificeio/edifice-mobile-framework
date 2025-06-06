import * as React from 'react';

import type { WikiHomeScreen } from './types';

import { I18n } from '~/app/i18n';
import { EmptyScreen } from '~/framework/components/empty-screens';
import { getSession } from '~/framework/modules/auth/reducer';
import { RootFolderId } from '~/framework/modules/explorer/model/types';
import ResourceExplorer, { ResourceExplorerTemplate } from '~/framework/modules/explorer/templates/resource-explorer';
import { createResourceExplorerNavBar } from '~/framework/modules/explorer/templates/resource-explorer/screen';
import moduleConfig from '~/framework/modules/wiki/module-config';
import { wikiRouteNames } from '~/framework/modules/wiki/navigation';
import { hasWikiCreationRights } from '~/framework/modules/wiki/rights';
import { selectors } from '~/framework/modules/wiki/store';

export const homeNavBar = createResourceExplorerNavBar('wiki-home-title', selectors.explorer);

const wikiExplorerContext = {
  application: 'wiki',
  resource_type: 'wiki',
};

export default function WikiHomeScreen({ navigation, route, ...props }: WikiHomeScreen.AllProps) {
  const popupActions = React.useMemo(
    () => [
      {
        action: () => navigation.navigate(wikiRouteNames.create, {}),
        icon: {
          android: 'ic_plus',
          ios: 'plus.square',
        },
        title: 'nouveau cours',
      },
    ],
    [navigation],
  );

  const onOpenResource = React.useCallback<NonNullable<ResourceExplorerTemplate.Props['onOpenResource']>>(
    r => {
      navigation.navigate(wikiRouteNames.summary, { resourceId: r.assetId });
    },
    [navigation],
  );

  const session = getSession();
  const hasCreateRight = session && hasWikiCreationRights(session);

  const emptyComponent = React.useMemo(
    () =>
      route.params.folderId === RootFolderId.ROOT ? (
        hasCreateRight ? (
          <EmptyScreen
            svgImage="empty-wiki"
            title={I18n.get('wiki-explorer-emptyscreen-root-create-title')}
            text={I18n.get('wiki-explorer-emptyscreen-root-create-text')}
            buttonText={I18n.get('wiki-explorer-emptyscreen-root-create-button')}
            buttonUrl="/wiki"
          />
        ) : (
          <EmptyScreen
            svgImage="empty-wiki"
            title={I18n.get('wiki-explorer-emptyscreen-root-title')}
            text={I18n.get('wiki-explorer-emptyscreen-root-text')}
          />
        )
      ) : (
        <EmptyScreen
          svgImage="empty-folder"
          title={I18n.get('wiki-explorer-emptyscreen-folder-title')}
          text={I18n.get('wiki-explorer-emptyscreen-folder-text')}
          {...(hasCreateRight ? { buttonText: 'wiki-explorer-emptyscreen-folder-create-button' } : undefined)}
          buttonText={I18n.get('wiki-explorer-emptyscreen-root-create-button')}
          buttonUrl="/wiki"
        />
      ),
    [route.params.folderId, hasCreateRight],
  );

  // React.useEffect(() => {
  //   navigation.setOptions({
  //     headerRight: () => (
  //       <PopupMenu actions={popupActions}>
  //         <NavBarAction icon="ui-options" />
  //       </PopupMenu>
  //     ),
  //   });
  // }, [navigation, popupActions]);

  return (
    <ResourceExplorer
      {...props}
      navigation={navigation as ResourceExplorerTemplate.NavigationProps['navigation']}
      route={route as ResourceExplorerTemplate.NavigationProps['route']}
      moduleConfig={moduleConfig}
      onOpenResource={onOpenResource}
      selectors={selectors.explorer}
      emptyComponent={emptyComponent}
      context={wikiExplorerContext}
    />
  );
}
