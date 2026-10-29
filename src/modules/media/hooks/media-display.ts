import React from 'react';

import { getMediaDisplay } from '~/modules/media/display';
import type { Media } from '~/modules/media/types';

/**
 * Printable information about a media: its icon and its thumbnail (see `getMediaDisplay`).
 * For a media that can be a resource of an app, `useResourceDisplay` also gives its colors.
 */
export const useMediaDisplay = (media: Media) => React.useMemo(() => getMediaDisplay(media), [media]);
