import * as React from 'react';

import type { CollaborativewallViewerScreenPrivateProps } from './types';

import { computeWebResourceViewerNavbar, WebResourceViewer } from '~/framework/components/pages/web-resource-viewer';
import { collaborativewallService, collaborativewallUriParser } from '~/framework/modules/collaborativewall/service';

export const computeNavBar = computeWebResourceViewerNavbar;

export default function CollaborativewallViewerScreen(props: CollaborativewallViewerScreenPrivateProps) {
  const { navigation, route } = props;
  return (
    <WebResourceViewer
      navigation={navigation}
      source={React.useMemo(() => collaborativewallUriParser.stringify(route.params.id), [route.params.id])}
      fetchResource={React.useCallback(async () => {
        await collaborativewallService.get(route.params.id);
      }, [route.params.id])}
    />
  );
}
