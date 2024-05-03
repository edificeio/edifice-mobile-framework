import * as React from 'react';

import WebResourceViewer, { computeWebResourceViewerNavbar } from '~/framework/components/pages/web-resource-viewer';
import { scrapbookService } from '~/framework/modules/scrapbook/service';

import { ScrapbookDetailsScreenProps } from './types';

export const computeNavBar = computeWebResourceViewerNavbar;

const scrapbookSearchParams = { fullscreen: 'true' };

export default function ScrapbookViewerScreen(props: ScrapbookDetailsScreenProps) {
  const { navigation, route } = props;

  return (
    <WebResourceViewer
      navigation={navigation}
      source={route.params.resourceUri}
      fetchResource={React.useCallback(async () => {
        const id = route.params.resourceUri.replace('/scrapbook#/view-scrapbook/', '');
        await scrapbookService.get(id);
      }, [route.params.resourceUri])}
      injectSearchParams={scrapbookSearchParams}
    />
  );
}
