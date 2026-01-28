import * as React from 'react';
import { Pressable, View } from 'react-native';

import Swiper from 'react-native-swiper';

import { MyAppsOnboardingSlide } from './my-apps-onboarding-slide';
import { styles } from './styles';
import { MyAppsOnboardingModalProps } from './types';

import theme from '~/app/theme';
import { getScaleWidth, UI_STYLES } from '~/framework/components/constants';
import ModalBox, { ModalBoxHandle } from '~/framework/components/ModalBox';
import { Svg } from '~/framework/components/picture';
import { BodyBoldText } from '~/framework/components/text';

export const MyAppsOnboardingModal = React.forwardRef<ModalBoxHandle, MyAppsOnboardingModalProps>(
  ({ onComplete, onDismiss, slides }, ref) => {
    const swiperRef = React.useRef<Swiper | null>(null);
    const [index, setIndex] = React.useState(0);
    const iconDimentsion = {
      height: getScaleWidth(14),
      width: getScaleWidth(14),
    };
    const isLast = index === slides.length - 1;

    const resetOnboarding = React.useCallback(() => {
      setIndex(0);

      requestAnimationFrame(() => {
        swiperRef.current?.scrollBy(-index, false);
      });
    }, [index]);

    const handleNext = () => {
      if (isLast) {
        resetOnboarding();
        onComplete();
      } else {
        swiperRef.current?.scrollBy(1);
      }
    };

    const renderNavigation = () => (
      <View style={styles.actions}>
        {index > 0 ? (
          <Pressable style={styles.navButton} onPress={() => swiperRef.current?.scrollBy(-1)}>
            <Svg
              {...iconDimentsion}
              name="ui-chevron-left"
              fill={isLast ? theme.palette.grey.graphite : theme.palette.primary.regular}
            />
            <BodyBoldText style={[styles.navButtonText, isLast && styles.navButtonPrimary]}>Précédent</BodyBoldText>
          </Pressable>
        ) : (
          <Pressable onPress={onDismiss}>
            <BodyBoldText style={styles.navButtonPrimary}>Plus tard</BodyBoldText>
          </Pressable>
        )}

        <Pressable style={styles.navButton} onPress={handleNext}>
          <BodyBoldText style={styles.navButtonText}>{isLast ? "C'est compris" : 'Suivant'}</BodyBoldText>

          {!isLast && <Svg {...iconDimentsion} name="ui-chevron-right" fill={theme.palette.primary.regular} />}
        </Pressable>
      </View>
    );

    return (
      <ModalBox
        ref={ref}
        content={
          <View style={styles.container}>
            <Swiper
              ref={swiperRef}
              renderPagination={(idx, total) => (
                <View style={styles.pagination}>
                  {Array.from({ length: total }).map((_, i) => (
                    <Pressable
                      key={`dot#${i}`}
                      hitSlop={10}
                      onPress={() => {
                        if (i !== idx) {
                          swiperRef.current?.scrollBy(i - idx, true);
                        }
                      }}>
                      <View style={[styles.dot, i === idx && styles.activeDot]} />
                    </Pressable>
                  ))}
                </View>
              )}
              loop={false}
              onIndexChanged={setIndex}
              dotStyle={styles.dot}
              activeDotStyle={styles.activeDot}
              paginationStyle={styles.pagination}>
              {slides.map((slide, i) => (
                <View key={slide.key} style={UI_STYLES.flex1}>
                  <MyAppsOnboardingSlide {...slide} isActive={i === index} />
                </View>
              ))}
            </Swiper>

            {renderNavigation()}
          </View>
        }
      />
    );
  },
);
