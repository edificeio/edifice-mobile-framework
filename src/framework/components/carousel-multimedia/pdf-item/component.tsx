import React from 'react';
import { Platform, View } from 'react-native';

import Pdf from 'react-native-pdf';

import styles from './styles';
import { PdfItemProps } from './types';

import { PdfContext } from '~/framework/components/carousel-multimedia/screen';

const MIN_PDF_SCALE = 1;
const MAX_PDF_SCALE = 5;
const isIos = Platform.OS === 'ios';

const PdfItem = ({ hideNavBar, isNavBarVisible, setIsCarouselSwipeEnabled, source, toggleNavBar }: PdfItemProps) => {
  const [resetComponent, setResetComponent] = React.useState(0);
  const scaleRef = React.useRef<number>(MIN_PDF_SCALE);
  const pdfContextValue = React.useContext(PdfContext);

  const onZoom = React.useCallback(
    (scale: number) => {
      scale > MIN_PDF_SCALE && isNavBarVisible && hideNavBar();
      scaleRef.current = scale;
      // lock swipe if zoomed
      if (scaleRef.current > MIN_PDF_SCALE && pdfContextValue.disableCarouselSwipe === undefined) {
        setIsCarouselSwipeEnabled(false);
        // unlock pdf swipe & reset zoom in context callback
        pdfContextValue.disableCarouselSwipe = () => {
          setResetComponent(prev => prev + 1);
          setIsCarouselSwipeEnabled(true);
        };
      } else if (scaleRef.current <= MIN_PDF_SCALE) {
        // unlock swipe if dezoomed
        setIsCarouselSwipeEnabled(true);
        pdfContextValue.disableCarouselSwipe = undefined;
      }
    },
    [hideNavBar, isNavBarVisible, pdfContextValue, setIsCarouselSwipeEnabled],
  );

  return (
    <View style={styles.flex1}>
      <Pdf
        key={resetComponent}
        source={source}
        style={styles.flex1}
        // enablePaging renders poorly on Android
        enablePaging={isIos}
        horizontal={false}
        trustAllCerts={false}
        minScale={MIN_PDF_SCALE}
        maxScale={MAX_PDF_SCALE}
        onPageSingleTap={toggleNavBar}
        onScaleChanged={onZoom}
        scale={MIN_PDF_SCALE}
      />
    </View>
  );
};

export default PdfItem;
