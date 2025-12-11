import React from 'react';
import { Platform, View } from 'react-native';

import Pdf from 'react-native-pdf';

import styles from './styles';

interface ZoomablePdfProps {
  source: { uri?: string };
  setIsCarouselSwipeEnabled: (isEnabled: boolean) => void;
}

const MIN_PDF_SCALE = 1;
const MAX_PDF_SCALE = 5;
const isIos = Platform.OS === 'ios';

const ZoomablePdf = ({ setIsCarouselSwipeEnabled, source }: ZoomablePdfProps) => {
  //   const onScrollPositionChanged = React.useCallback(
  //     (x: number, y: number, zoom: number) => {
  //       if (isIos) return;

  //       if (zoom > MIN_PDF_SCALE) {
  //         setIsCarouselSwipeEnabled(false);
  //       } else {
  //         setIsCarouselSwipeEnabled(true);
  //       }
  //     },
  //     [setIsCarouselSwipeEnabled],
  //   );

  const onScaleChanged = React.useCallback(
    (scale: number) => {
      if (isIos) return;

      if (scale > MIN_PDF_SCALE) {
        setIsCarouselSwipeEnabled(false);
      } else {
        setIsCarouselSwipeEnabled(true);
      }
    },
    [setIsCarouselSwipeEnabled],
  );

  return (
    <View style={styles.flex1}>
      <Pdf
        source={source}
        style={styles.flex1}
        // enablePaging is mandatory on iOS, otherwise the PDF won't scroll
        enablePaging={isIos}
        horizontal={false}
        trustAllCerts={false}
        minScale={MIN_PDF_SCALE}
        maxScale={MAX_PDF_SCALE}
        // onScrollPositionChanged={onScrollPositionChanged}
        onScaleChanged={onScaleChanged}
      />
    </View>
  );
};

export default ZoomablePdf;
