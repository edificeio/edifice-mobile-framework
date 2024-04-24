import * as React from 'react';

import { WebResourceViewer, computeWebResourceViewerNavbar } from '~/framework/components/pages/web-resource-viewer';
import { collaborativewallService, collaborativewallUriParser } from '~/framework/modules/collaborativewall/service';

import type { CollaborativewallViewerScreenPrivateProps } from './types';

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
