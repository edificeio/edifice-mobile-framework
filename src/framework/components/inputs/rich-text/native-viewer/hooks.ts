import * as React from 'react';

import { ImageSize } from './types';

// Natural sizes measured on load: they survive the FlashList cell recycling and the remounts of the viewer,
// so an image already seen is displayed at its final height straight away
const measuredImageSizes = new Map<string, ImageSize>();

/**
 * Natural size of an image: the size declared in the html when available, else the size measured on its first load.
 */
export const useImageNaturalSize = (src: string, declaredSize?: ImageSize) => {
  const [measuredSize, setMeasuredSize] = React.useState(() => measuredImageSizes.get(src));

  // The cell may be recycled for another image
  React.useEffect(() => {
    setMeasuredSize(measuredImageSizes.get(src));
  }, [src]);

  const onMeasured = React.useCallback(
    (size: ImageSize) => {
      if (!size.width || !size.height) return;
      measuredImageSizes.set(src, size);
      setMeasuredSize(size);
    },
    [src],
  );

  return { naturalSize: declaredSize ?? measuredSize, onMeasured };
};
