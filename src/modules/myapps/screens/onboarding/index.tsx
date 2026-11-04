/**
 * Onboarding of « Mes applis »: slides about the favorites and the long press. Shown automatically (see `useAutoOnboarding`), or by
 * the button of the header. Going through it to the end marks its version as seen; closing it before doesn't.
 */
import * as React from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, TouchableOpacity, View } from 'react-native';

import { StaticScreenProps, useNavigation } from '@react-navigation/native';

import { defineModal } from '~/app/navigation-new';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { BodyBoldText } from '~/framework/components/text';
import { useStorageJSON } from '~/framework/util/storage/hooks';
import { ONBOARDING_VERSION } from '~/modules/myapps/model/onboarding';
import { storage } from '~/modules/myapps/storage';
import { I18n } from '~/util/i18n';

import { MyAppsOnboardingSlide } from './slide';
import { styles } from './styles';
import type { OnboardingSlide } from './types';

const TEST_ID_PREFIX = 'myapps-onboarding-modal';

const getSlides = (): OnboardingSlide[] => [
  {
    description: I18n.get('myapp-onboarding-favorites-description'),
    illustration: { name: 'ui-myapps-list', type: 'svg' },
    key: 'applist',
    subtitle: I18n.get('myapp-onboarding-favorites-subtitle'),
    title: I18n.get('myapp-onboarding-favorites-title'),
  },
  {
    description: I18n.get('myapp-onboarding-lonpress-description'),
    illustration: { source: require('ASSETS/animations/myapps/myapps-more-actions.json'), type: 'animated' },
    key: 'longpress',
    subtitle: I18n.get('myapp-onboarding-longpress-subtitle'),
    title: I18n.get('myapp-onboarding-longpress-title'),
  },
  {
    description: I18n.get('myapp-onboarding-favorite-add-description'),
    illustration: { name: 'ui-make-favorite', type: 'svg' },
    key: 'add-favorite',
    subtitle: I18n.get('myapp-onboarding-favorite-add-subtitle'),
    title: I18n.get('myapp-onboarding-favorite-add-title'),
  },
];

function MyAppsOnboardingScreen({}: StaticScreenProps<undefined>) {
  const navigation = useNavigation();
  const [, setOnboarding] = useStorageJSON(storage, 'onboarding');
  const slides = React.useMemo(getSlides, []);

  const scrollRef = React.useRef<React.ComponentRef<typeof ScrollView>>(null);
  const [index, setIndex] = React.useState(0);
  const [layoutWidth, setLayoutWidth] = React.useState(0);

  const isLast = index === slides.length - 1;
  const isFirst = index === 0;

  const close = React.useCallback(() => navigation.goBack(), [navigation]);

  const complete = React.useCallback(() => {
    setOnboarding({ seen: true, version: ONBOARDING_VERSION });
    navigation.goBack();
  }, [navigation, setOnboarding]);

  const scrollToIndex = React.useCallback(
    (targetIndex: number) => scrollRef.current?.scrollTo({ animated: true, x: targetIndex * layoutWidth }),
    [layoutWidth],
  );

  const onMomentumEnd = React.useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const newIndex = Math.round(e.nativeEvent.contentOffset.x / layoutWidth);
      if (newIndex !== index) setIndex(newIndex);
    },
    [index, layoutWidth],
  );

  const onNext = () => (isLast ? complete() : scrollToIndex(index + 1));
  const onPrevious = () => (isFirst ? close() : scrollToIndex(index - 1));

  return (
    <View style={styles.screen} testID={TEST_ID_PREFIX}>
      <Pressable style={styles.backdrop} onPress={close} accessible={false} />
      <View style={styles.card}>
        <View
          style={styles.container}
          onLayout={e => {
            const { width } = e.nativeEvent.layout;
            if (width && width !== layoutWidth) {
              setLayoutWidth(width);
              requestAnimationFrame(() => scrollRef.current?.scrollTo({ animated: false, x: index * width }));
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
                    <View key={slide.key} style={[styles.slide, { width: layoutWidth }]}>
                      <MyAppsOnboardingSlide {...slide} isActive={i === index} />
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>

          <View style={styles.bottom}>
            <View style={styles.navSide}>
              <Pressable
                testID={isFirst ? `${TEST_ID_PREFIX}-later` : `${TEST_ID_PREFIX}-previous`}
                style={!isFirst && styles.navButton}
                onPress={onPrevious}>
                {!isFirst && <Svg name="ui-chevron-left" width={14} height={14} fill={theme.palette.grey.graphite} />}
                <BodyBoldText numberOfLines={1} ellipsizeMode="tail" style={styles.navButtonPrimary}>
                  {I18n.get(isFirst ? 'myapp-onboarding-skip' : 'myapp-onboarding-previous')}
                </BodyBoldText>
              </Pressable>
            </View>

            <View style={styles.navSide}>
              <Pressable
                testID={isLast ? `${TEST_ID_PREFIX}-complete` : `${TEST_ID_PREFIX}-next`}
                style={styles.navButton}
                onPress={onNext}>
                <BodyBoldText numberOfLines={1} ellipsizeMode="tail" style={styles.navButtonText}>
                  {I18n.get(isLast ? 'myapp-onboarding-complete' : 'myapp-onboarding-next')}
                </BodyBoldText>
                {!isLast && <Svg name="ui-chevron-right" width={14} height={14} fill={theme.palette.primary.regular} />}
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.closeButton}>
          <TouchableOpacity testID={`${TEST_ID_PREFIX}-close`} onPress={close}>
            <Svg
              name="ui-close"
              width={UI_SIZES.dimensions.width.large}
              height={UI_SIZES.dimensions.height.large}
              fill={theme.palette.grey.black}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default defineModal({
  options: () => ({ animation: 'fade', headerShown: false, presentation: 'transparentModal' }),
  screen: MyAppsOnboardingScreen,
});
