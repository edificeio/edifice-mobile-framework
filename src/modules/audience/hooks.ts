import React from 'react';

import { useFocusEffect } from '~/app/navigation-new';
import { markViewAudience } from '~/modules/audience/actions';
import type { AudienceReferer } from '~/modules/audience/model';

/**
 * The main hook to use audience features.
 * Currently this handles only marking views as seen: once each time the screen gets the focus.
 * @param referer the resource shown by the screen.
 */
export function useAudience(referer: AudienceReferer) {
  const viewMarked = React.useRef(false);

  useFocusEffect(
    React.useCallback(() => {
      viewMarked.current = false;
    }, []),
  );

  const { module, resourceId, resourceType } = referer;
  return React.useMemo(
    () => ({
      markView: async () => {
        if (viewMarked.current === false) await markViewAudience({ module, resourceId, resourceType });
        viewMarked.current = true;
      },
    }),
    [module, resourceId, resourceType],
  );
}
