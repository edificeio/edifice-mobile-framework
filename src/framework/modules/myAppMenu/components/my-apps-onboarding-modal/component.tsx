import * as React from 'react';
import { Pressable, View } from 'react-native';

import Swiper from 'react-native-swiper';

import { MyAppsOnboardingSlide } from './my-apps-onboarding-slide';
import { styles } from './styles';
import { MyAppsOnboardingModalProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { getScaleWidth, UI_STYLES } from '~/framework/components/constants';
import ModalBox, { ModalBoxHandle } from '~/framework/components/ModalBox';
import { Svg } from '~/framework/components/picture';
import { BodyBoldText } from '~/framework/components/text';

const ICON_DIMENSIONS = {
  height: getScaleWidth(14),
  width: getScaleWidth(14),
};
export const MyAppsOnboardingModal = React.forwardRef<ModalBoxHandle, MyAppsOnboardingModalProps>(
  ({ onComplete, onDismiss, slides }, ref) => {
    const getLang = I18n.get;

    const modalBoxRef = React.useRef<ModalBoxHandle | null>(null);
    const swiperRef = React.useRef<Swiper | null>(null);

    const [index, setIndex] = React.useState<number>(0);
    const [swiperKey, setSwiperKey] = React.useState<number>(0);

    const isLast = index === slides.length - 1;

    const resetOnboarding = React.useCallback(() => {
      setIndex(0);
      setSwiperKey(k => k + 1);
    }, []);

    const closeModal = React.useCallback(() => {
      resetOnboarding();
      modalBoxRef.current?.doDismissModal();
      onDismiss?.();
    }, [onDismiss, resetOnboarding]);

    const completeAndClose = React.useCallback(() => {
      resetOnboarding();
      modalBoxRef.current?.doDismissModal();
      onComplete();
    }, [onComplete, resetOnboarding]);

    const handleNext = React.useCallback(() => {
      if (isLast) {
        completeAndClose();
      } else {
        swiperRef.current?.scrollBy(1);
      }
    }, [isLast, completeAndClose]);

    const handlePrevious = React.useCallback(() => {
      swiperRef.current?.scrollBy(-1);
    }, []);

    const renderNavigation = React.useCallback(
      () => (
        <View style={styles.actions}>
          {index > 0 ? (
            <Pressable style={styles.navButton} onPress={handlePrevious}>
              <Svg {...ICON_DIMENSIONS} name="ui-chevron-left" fill={theme.palette.primary.regular} />
              <BodyBoldText style={styles.navButtonText}>{getLang('myapp-onboarding-previous')}</BodyBoldText>
            </Pressable>
          ) : (
            <Pressable onPress={closeModal}>
              <BodyBoldText style={styles.navButtonPrimary}>{getLang('myapp-onboarding-skip')}</BodyBoldText>
            </Pressable>
          )}

          <Pressable style={styles.navButton} onPress={handleNext}>
            <BodyBoldText style={styles.navButtonText}>
              {isLast ? getLang('myapp-onboarding-complete') : getLang('myapp-onboarding-next')}
            </BodyBoldText>

            {!isLast && <Svg {...ICON_DIMENSIONS} name="ui-chevron-right" fill={theme.palette.primary.regular} />}
          </Pressable>
        </View>
      ),
      [closeModal, getLang, handleNext, handlePrevious, index, isLast],
    );

    React.useImperativeHandle(ref, () => ({
      doDismissModal: () => {
        modalBoxRef.current?.doDismissModal();
      },
      doShowModal: () => {
        resetOnboarding();
        modalBoxRef.current?.doShowModal();
      },
    }));

    return (
      <ModalBox
        ref={modalBoxRef}
        content={
          <View style={styles.container}>
            <Swiper
              key={swiperKey}
              ref={swiperRef}
              loop={false}
              onIndexChanged={setIndex}
              renderPagination={idx => (
                <View style={styles.pagination}>
                  {slides.map((slide, i) => (
                    <Pressable
                      key={`dot-${slide.key}`}
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
              )}>
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

export default MyAppsOnboardingModal;
