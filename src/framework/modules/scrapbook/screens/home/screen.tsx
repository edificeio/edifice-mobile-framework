import * as React from 'react';

import { useHeaderHeight } from '@react-navigation/elements';

import { ScrapbookHomeScreenProps } from './types';
import { selectors } from '../../store';

import { I18n } from '~/app/i18n';
import { EmptyScreen } from '~/framework/components/empty-screens';
import { sessionScreen } from '~/framework/components/screen';
import ResourceExplorer from '~/framework/modules/explorer/templates/resource-explorer';
import ResourceExplorerTemplate, {
  createResourceExplorerNavBar,
} from '~/framework/modules/explorer/templates/resource-explorer/screen';
import moduleConfig from '~/framework/modules/scrapbook/module-config';
import { scrapbookRouteNames } from '~/framework/modules/scrapbook/navigation';

export const computeNavBar = createResourceExplorerNavBar('scrapbook-appname', selectors.explorer);

const explorerContext = {
  application: 'scrapbook',
  resource_type: 'scrapbook',
};

export default sessionScreen<ScrapbookHomeScreenProps>(function ScrapbookHomeScreen({ navigation, route, ...props }) {
  const headerHeight = useHeaderHeight();

  const emptyComponent = React.useMemo(() => {
    return (
      <EmptyScreen
        svgImage="empty-hammock"
        title={I18n.get('scrapbook-emptyscreen-title')}
        text={I18n.get('scrapbook-emptyscreen-text')}
      />
    );
  }, []);

  const onOpenResource = React.useCallback<NonNullable<ResourceExplorerTemplate.Props['onOpenResource']>>(
    item => {
      navigation.navigate(scrapbookRouteNames.details, {
        headerHeight,
        resourceUri: `/scrapbook#/view-scrapbook/${item.resourceEntId}`,
      });
    },
    [headerHeight, navigation],
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
      context={explorerContext}
    />
  );
});
