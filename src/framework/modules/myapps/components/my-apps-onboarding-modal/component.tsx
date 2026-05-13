import * as React from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, View } from 'react-native';

import { MyAppsOnboardingSlide } from './my-apps-onboarding-slide';
import { styles } from './styles';
import { MyAppsOnboardingModalProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import ModalBox, { ModalBoxHandle } from '~/framework/components/ModalBox';
import { Svg } from '~/framework/components/picture';
import { BodyBoldText } from '~/framework/components/text';

export const MyAppsOnboardingModal = React.forwardRef<ModalBoxHandle, MyAppsOnboardingModalProps>(
  ({ onComplete, onDismiss, slides }, ref) => {
    const getLang = I18n.get;

    const modalBoxRef = React.useRef<ModalBoxHandle>(null);
    const scrollRef = React.useRef<ScrollView>(null);
    const [index, setIndex] = React.useState(0);
    const [layoutWidth, setLayoutWidth] = React.useState(0);

    const isLast = index === slides.length - 1;
    const isFirst = index === 0;

    const leftLabel = isFirst ? getLang('myapp-onboarding-skip') : getLang('myapp-onboarding-previous');

    const reset = React.useCallback(() => {
      setIndex(0);
      scrollRef.current?.scrollTo({ animated: false, x: 0 });
    }, []);

    const closeModal = React.useCallback(() => {
      reset();
      modalBoxRef.current?.doDismissModal();
      onDismiss?.();
    }, [reset, onDismiss]);

    const completeAndClose = React.useCallback(() => {
      reset();
      modalBoxRef.current?.doDismissModal();
      onComplete();
    }, [reset, onComplete]);

    const scrollToIndex = React.useCallback(
      (targetIndex: number) => {
        scrollRef.current?.scrollTo({
          animated: true,
          x: targetIndex * layoutWidth,
        });
      },
      [layoutWidth],
    );

    const handleNext = () => {
      if (isLast) {
        completeAndClose();
      } else {
        scrollToIndex(index + 1);
      }
    };

    const handlePrevious = () => {
      scrollToIndex(index - 1);
    };

    const onMomentumEnd = React.useCallback(
      (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const newIndex = Math.round(e.nativeEvent.contentOffset.x / layoutWidth);

        if (newIndex !== index) setIndex(newIndex);
      },
      [index, layoutWidth],
    );

    React.useImperativeHandle(ref, () => ({
      doDismissModal: () => modalBoxRef.current?.doDismissModal(),
      doShowModal: () => {
        reset();
        modalBoxRef.current?.doShowModal();
      },
    }));
    const leftAction = isFirst ? closeModal : handlePrevious;

    return (
      <ModalBox
        translucentStatusBar
        ref={modalBoxRef}
        useNativeDriver
        contentContainerStyle={styles.modalContentContainerStyle}
        content={
          <View
            style={styles.container}
            onLayout={e => {
              const { width } = e.nativeEvent.layout;

              if (width && width !== layoutWidth) {
                setLayoutWidth(width);

                requestAnimationFrame(() => {
                  scrollRef.current?.scrollTo({ animated: false, x: index * width });
                });
              }
            }}>
            <View style={styles.top}>
              <View style={styles.pagination}>
                {slides.map((slide, i) => (
                  <Pressable key={slide.key} onPress={() => scrollToIndex(i)}>
                    <View style={[styles.dot, i === index && styles.activeDot]} />
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.carousel}>
              <View style={styles.carouselInner}>
                {layoutWidth > 0 && (
                  <ScrollView
                    ref={scrollRef}
                    horizontal
                    pagingEnabled
                    bounces={false}
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={onMomentumEnd}>
                    {slides.map((slide, i) => (
                      <View key={slide.key ?? i} style={[styles.slide, { width: layoutWidth }]}>
                        <MyAppsOnboardingSlide {...slide} key={slide.key} isActive={i === index} />
                      </View>
                    ))}
                  </ScrollView>
                )}
              </View>
            </View>

            <View style={styles.bottom}>
              <View style={styles.navSide}>
                <Pressable style={!isFirst && styles.navButton} onPress={leftAction}>
                  {!isFirst && <Svg name="ui-chevron-left" width={14} height={14} fill={theme.palette.grey.graphite} />}

                  <BodyBoldText numberOfLines={1} ellipsizeMode="tail" style={styles.navButtonPrimary}>
                    {leftLabel}
                  </BodyBoldText>
                </Pressable>
              </View>

              <View style={styles.navSide}>
                <Pressable style={styles.navButton} onPress={handleNext}>
                  <BodyBoldText numberOfLines={1} ellipsizeMode="tail" style={styles.navButtonText}>
                    {isLast ? getLang('myapp-onboarding-complete') : getLang('myapp-onboarding-next')}
                  </BodyBoldText>

                  {!isLast && <Svg name="ui-chevron-right" width={14} height={14} fill={theme.palette.primary.regular} />}
                </Pressable>
              </View>
            </View>
          </View>
        }
      />
    );
  },
);

export default MyAppsOnboardingModal;
