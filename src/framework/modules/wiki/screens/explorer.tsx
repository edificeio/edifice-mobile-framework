/**
 * Wiki explorer: the folders and the wikis of the user (template of `explorer`).
 */
import * as React from 'react';

import type { StaticScreenProps } from '@react-navigation/native';

import { defineScreen, useNavigation } from '~/app/navigation-new';
import { EmptyScreen } from '~/framework/components/empty-screens';
import { RootFolderId } from '~/framework/modules/explorer/model/types';
import ResourceExplorer, {
  explorerScreenHeader,
  ResourceExplorerTemplate,
} from '~/framework/modules/explorer/templates/resource-explorer';
import { hasWikiCreationRights } from '~/framework/modules/wiki/model/business';
import { withSession } from '~/modules/auth/hoc';
import { I18n } from '~/util/i18n';

const wikiExplorerContext = {
  application: 'wiki',
  resource_type: 'wiki',
};

const WikiExplorerScreen = withSession<StaticScreenProps<ResourceExplorerTemplate.NavParams | undefined>>(function ({
  route,
  session,
}) {
  const navigation = useNavigation();

  const onOpenResource = React.useCallback<NonNullable<ResourceExplorerTemplate.Props['onOpenResource']>>(
    r => {
      navigation.navigate('wiki/summary', { resourceId: r.resourceId });
    },
    [navigation],
  );

  const hasCreateRight = hasWikiCreationRights(session.rights.authorizedActions);

  const emptyComponent = React.useMemo(
    () =>
      // The home of the explorer has no `folderId`: it is the root, as for the template
      (route.params?.folderId ?? RootFolderId.ROOT) === RootFolderId.ROOT ? (
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
          {...(hasCreateRight
            ? { buttonText: I18n.get('wiki-explorer-emptyscreen-folder-create-button'), buttonUrl: '/wiki' }
            : undefined)}
        />
      ),
    [route.params?.folderId, hasCreateRight],
  );

  return <ResourceExplorer onOpenResource={onOpenResource} emptyComponent={emptyComponent} context={wikiExplorerContext} />;
});
WikiExplorerScreen.displayName = 'WikiExplorerScreen';

export default defineScreen({
  options: explorerScreenHeader(wikiExplorerContext, 'wiki-home-title'),
  screen: WikiExplorerScreen,
});
