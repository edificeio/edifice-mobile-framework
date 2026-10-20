import * as React from 'react';

import { WebViewSourceUri } from 'react-native-webview/lib/WebViewTypes';

import type { H5PPlayerScreenProps } from './types';
import { h5pEmbedPath } from './util';

import { computeWebResourceViewerNavbar, WebResourceViewer } from '~/framework/components/pages/web-resource-viewer';
import { assertSession } from '~/framework/modules/auth/redux/reducer';
import { toURISource } from '~/framework/modules/media';
import { platformURISource } from '~/framework/util/transport';

export const computeNavBar = computeWebResourceViewerNavbar;

/**
 * Plays an H5P activity inserted in a rich content (wiki page…) through the platform embed page.
 * The URL belongs to the platform, so WebResourceViewer adds the queryparam_token that opens the session.
 */
export default function H5PPlayerScreen({ navigation, route }: H5PPlayerScreenProps) {
  const session = assertSession();
  return (
    <WebResourceViewer
      navigation={navigation}
      source={React.useMemo(
        () => platformURISource(session.platform, toURISource<WebViewSourceUri>(h5pEmbedPath(route.params.contentId))),
        [route.params.contentId, session.platform],
      )}
    />
  );
}
