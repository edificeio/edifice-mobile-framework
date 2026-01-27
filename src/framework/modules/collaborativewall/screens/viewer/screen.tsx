import * as React from 'react';

import { WebViewSourceUri } from 'react-native-webview/lib/WebViewTypes';

import type { CollaborativewallViewerScreenPrivateProps } from './types';

import { computeWebResourceViewerNavbar, WebResourceViewer } from '~/framework/components/pages/web-resource-viewer';
import { assertSession } from '~/framework/modules/auth/reducer';
import { collaborativewallService, collaborativewallUriParser } from '~/framework/modules/collaborativewall/service';
import { toURISource } from '~/framework/util/media';
import { platformURISource } from '~/framework/util/transport';

export const computeNavBar = computeWebResourceViewerNavbar;

export default function CollaborativewallViewerScreen(props: CollaborativewallViewerScreenPrivateProps) {
  const { navigation, route } = props;
  const session = assertSession();
  return (
    <WebResourceViewer
      navigation={navigation}
      source={React.useMemo(
        () =>
          platformURISource(session.platform, toURISource<WebViewSourceUri>(collaborativewallUriParser.stringify(route.params.id))),
        [route.params.id, session.platform],
      )}
      fetchResource={React.useCallback(async () => {
        await collaborativewallService.get(route.params.id);
      }, [route.params.id])}
    />
  );
}
