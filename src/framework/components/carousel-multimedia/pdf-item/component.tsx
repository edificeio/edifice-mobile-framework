import React from 'react';
import { View } from 'react-native';

import Pdf from 'react-native-pdf';

import styles from './styles';
import { PdfItemProps } from './types';

import LoaderItem from '~/framework/components/carousel-multimedia/loader-item/component';
import { PdfContext } from '~/framework/components/carousel-multimedia/screen';

const MIN_PDF_SCALE = 1;
const MAX_PDF_SCALE = 5;
const PDF_LOAD_TIMEOUT = 10000;

const PdfItem = ({
  hideNavBar,
  isNavBarVisible,
  isPdfLoadTimeout,
  isShown,
  setIsCarouselSwipeEnabled,
  setIsPdfError,
  setIsPdfLoadTimeout,
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

  const onPdfLoadComplete = React.useCallback(() => {
    setIsPdfLoaded(true);
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

  // Since onLoadComplete prop is broken, this is a workaround to ensure we do not stay indefinitely in loading state
  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    if (isShown && !isPdfLoaded && !isPdfLoadTimeout) {
      timeoutId = setTimeout(() => {
        setIsPdfLoadTimeout(true);
      }, PDF_LOAD_TIMEOUT);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isShown, isPdfLoaded, isPdfLoadTimeout, setIsPdfLoadTimeout]);

  return (
    <View style={styles.flex1}>
      <Pdf
        key={resetComponent}
        minScale={MIN_PDF_SCALE}
        maxScale={MAX_PDF_SCALE}
        onError={onPdfError}
        onLoadComplete={onPdfLoadComplete}
        onPageSingleTap={toggleNavBar}
        onScaleChanged={onZoom}
        scale={MIN_PDF_SCALE}
        source={source}
        style={styles.flex1}
        trustAllCerts={false}
      />
      {!isPdfLoaded && <LoaderItem />}
    </View>
  );
};

export default PdfItem;
