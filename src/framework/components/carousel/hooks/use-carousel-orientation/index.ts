import * as React from 'react';

import Orientation, {
  LANDSCAPE_LEFT,
  LANDSCAPE_RIGHT,
  OrientationLockerProps,
  OrientationType,
  PORTRAIT,
} from 'react-native-orientation-locker';

export const useCarouselOrientation = () => {
  const [orientation, setOrientation] = React.useState<OrientationLockerProps['orientation']>(PORTRAIT);

  const onOrientationChange = React.useCallback((newOrientation: OrientationType) => {
    if (newOrientation === 'PORTRAIT') setOrientation(PORTRAIT);
    else if (newOrientation === 'LANDSCAPE-LEFT') setOrientation(LANDSCAPE_LEFT);
    else if (newOrientation === 'LANDSCAPE-RIGHT') setOrientation(LANDSCAPE_RIGHT);
  }, []);

  // Lock to portrait when leaving carousel
  React.useEffect(() => {
    return () => {
      Orientation.lockToPortrait();
    };
  }, []);

  return { onOrientationChange, orientation };
};
