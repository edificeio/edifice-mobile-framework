import React from 'react';
import { Platform, View } from 'react-native';

import Pdf from 'react-native-pdf';

import styles from './styles';
import { PdfItemProps } from './types';

import LoaderItem from '~/framework/components/carousel-multimedia/loader-item/component';
import { PdfContext } from '~/framework/components/carousel-multimedia/screen';

/**
 * Known issues with the react-native-pdf library :
 * 1 - The prop onLoadComplete is completely broken and unusable
 * 2 - The onError prop is not reliable, sometimes triggered for nothing
 */

const MIN_PDF_SCALE = 1;
const MAX_PDF_SCALE = 5;
// Workaround to know if the loading process has at least started since onLoadComplete is unusable
const MIN_LOADING_PROGRESS = 0.00001;
const isIos = Platform.OS === 'ios';

const PdfItem = ({
  hideNavBar,
  isNavBarVisible,
  isShown,
  setIsCarouselSwipeEnabled,
  setIsPdfError,
  source,
  toggleNavBar,
}: PdfItemProps) => {
  const [resetComponent, setResetComponent] = React.useState(0);
  const scaleRef = React.useRef<number>(MIN_PDF_SCALE);
  const pdfContextValue = React.useContext(PdfContext);
  const [isPdfLoaded, setIsPdfLoaded] = React.useState(false);

  const onPdfError = React.useCallback(() => {
    setIsPdfError(true);
  }, [setIsPdfError]);

  const onPdfLoadProgress = React.useCallback((progress: number) => {
    if (progress >= MIN_LOADING_PROGRESS) {
      setIsPdfLoaded(true);
    }
  }, []);

  const onZoom = React.useCallback(
    (scale: number) => {
      scale > MIN_PDF_SCALE && isNavBarVisible && hideNavBar();
      scaleRef.current = scale;
      // lock swipe if zoomed
      // use isShown is necessary to get rid of the component duplication effect created by react-native-reanimated-carousel
      if (isShown && scaleRef.current > MIN_PDF_SCALE && pdfContextValue.disableCarouselSwipe === undefined) {
        setIsCarouselSwipeEnabled(false);
        // unlock pdf swipe & reset zoom in context callback
        pdfContextValue.disableCarouselSwipe = () => {
          setResetComponent(prev => prev + 1);
          setIsCarouselSwipeEnabled(true);
        };
      } else if (isShown && scaleRef.current <= MIN_PDF_SCALE) {
        // unlock swipe if dezoomed
        setIsCarouselSwipeEnabled(true);
        pdfContextValue.disableCarouselSwipe = undefined;
      }
    },
    [hideNavBar, isNavBarVisible, isShown, pdfContextValue, setIsCarouselSwipeEnabled],
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
        onError={onPdfError}
        onLoadProgress={onPdfLoadProgress}
        onPageSingleTap={toggleNavBar}
        onScaleChanged={onZoom}
        scale={MIN_PDF_SCALE}
      />
      {!isPdfLoaded && <LoaderItem />}
    </View>
  );
};

export default PdfItem;
