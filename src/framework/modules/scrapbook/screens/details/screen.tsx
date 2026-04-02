import * as React from 'react';

import { WebViewSourceUri } from 'react-native-webview/lib/WebViewTypes';

import { ScrapbookDetailsScreenProps } from './types';

import WebResourceViewer, { computeWebResourceViewerNavbar } from '~/framework/components/pages/web-resource-viewer';
import { assertSession } from '~/framework/modules/auth/redux/reducer';
import { scrapbookService } from '~/framework/modules/scrapbook/service';
import { toURISource } from '~/framework/util/media';
import { platformURISource } from '~/framework/util/transport';

export const computeNavBar = computeWebResourceViewerNavbar;

export default function ScrapbookViewerScreen(props: ScrapbookDetailsScreenProps) {
  const { navigation, route } = props;
  const session = assertSession();
  const source = React.useMemo(() => {
    const result = platformURISource(session.platform, toURISource<WebViewSourceUri>(route.params.resourceUri));
    const uri = new URL(result.uri);
    uri.searchParams.append('fullscreen', 'true');
    return { ...result, uri: uri.href };
  }, [route.params.resourceUri, session.platform]);

  return (
    <WebResourceViewer
      navigation={navigation}
      source={source}
      fetchResource={React.useCallback(async () => {
        const id = route.params.resourceUri.replace('/scrapbook#/view-scrapbook/', '');
        await scrapbookService.get(id);
      }, [route.params.resourceUri])}
    />
  );
}
