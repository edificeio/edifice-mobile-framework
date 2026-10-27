import * as React from 'react';
import { View } from 'react-native';

import moment from 'moment';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { I18n } from '~/app/i18n';
import { modalScreenOptions } from '~/app/navigation/util';
import { UI_SIZES } from '~/framework/components/constants';
import DayPicker from '~/framework/components/pickers/day';
import DropdownPicker from '~/framework/components/pickers/dropdown';
import ScrollView from '~/framework/components/scrollView';
import SegmentedControl from '~/framework/components/segmented-control';
import { withSession } from '~/framework/modules/auth/util';
import { MenuLegend, MenuSteps, MenuStepsPlaceholder } from '~/framework/modules/widgets/cantine/components/menu';
import { useCantineMenu } from '~/framework/modules/widgets/cantine/hooks/menu';
import { getSelectedStructure, selectedStructureStorage } from '~/framework/modules/widgets/cantine/storage';
import { WidgetMessage } from '~/framework/modules/widgets/components/message';
import { ISO_DATE_FORMAT } from '~/framework/util/date';

import styles from './styles';
import { SwipeDirection } from './types';

const LUNCH_SEGMENT = 0;
const DINNER_SEGMENT = 1;
const SWIPE_THRESHOLD = 50;
const SWIPE_ANIMATION_DURATION = 200;
// keep the exit animation duration between these bounds.
const SWIPE_EXIT_MIN_DURATION = 80;
const SWIPE_EXIT_MAX_DURATION = 200;
const SWIPE_ENTER_EASING = Easing.out(Easing.cubic);

// skip Sunday because not available in the picker.
const shiftDay = (date: string, direction: SwipeDirection) => {
  const dayOfWeek = moment(date).day();
  const step =
    (direction === SwipeDirection.LEFT && dayOfWeek === 6) || (direction === SwipeDirection.RIGHT && dayOfWeek === 1) ? 2 : 1;
  return direction === SwipeDirection.LEFT
    ? moment(date).add(step, 'day').format(ISO_DATE_FORMAT)
    : moment(date).subtract(step, 'day').format(ISO_DATE_FORMAT);
};

function useDaySwipe(selectedDate: string, onDayChange: (date: string) => void) {
  const translateX = useSharedValue(0);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));
  // start entering animation after the selected day has rendered.
  const enteringSide = React.useRef<number>(0);
  // prevent another swipe while the day is changing.
  const isChangingDay = useSharedValue(false);

  React.useEffect(() => {
    if (!enteringSide.current) return;
    translateX.value = enteringSide.current * UI_SIZES.screen.width;
    translateX.value = withTiming(0, { duration: SWIPE_ANIMATION_DURATION, easing: SWIPE_ENTER_EASING }, () => {
      isChangingDay.value = false;
    });
    enteringSide.current = 0;
  }, [isChangingDay, selectedDate, translateX]);

  const changeDay = (direction: SwipeDirection) => {
    enteringSide.current = direction === SwipeDirection.LEFT ? 1 : -1;
    onDayChange(shiftDay(selectedDate, direction));
  };

  const gesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    // let vertical gestures pass through to the scrollView.
    .failOffsetY([-10, 10])
    .onUpdate(event => {
      if (isChangingDay.value) return;
      translateX.value = event.translationX;
    })
    .onEnd((event, success) => {
      if (isChangingDay.value) return;
      if (!success || Math.abs(event.translationX) <= SWIPE_THRESHOLD) {
        translateX.value = withTiming(0, { duration: SWIPE_ANIMATION_DURATION });
        return;
      }
      const direction = event.translationX < 0 ? SwipeDirection.LEFT : SwipeDirection.RIGHT;
      const exitOffset = Math.sign(event.translationX) * UI_SIZES.screen.width;
      const remainingDistance = Math.abs(exitOffset - event.translationX);
      const fingerDuration = (remainingDistance / Math.max(Math.abs(event.velocityX), 1)) * 1000;
      const exitDuration = Math.min(Math.max(fingerDuration, SWIPE_EXIT_MIN_DURATION), SWIPE_EXIT_MAX_DURATION);
      isChangingDay.value = true;
      translateX.value = withTiming(exitOffset, { duration: exitDuration, easing: Easing.linear }, finished => {
        if (finished) scheduleOnRN(changeDay, direction);
        else isChangingDay.value = false;
      });
    });

  return { gesture, style };
}

export const computeNavBar = modalScreenOptions('modal', () => ({ title: I18n.get('widget-cantine-home-title') }));

const CantineHomeScreen = withSession<{ embedded?: boolean; noScroll?: boolean }>(
  ({ embedded = false, noScroll = false, session }) => {
    const userStructures = session.user.structures ?? [];

    const dropdownItemsStructures = userStructures.map(s => ({ label: s.name, value: s.UAI }));

    const [selectedDate, setSelectedDate] = React.useState<string>(() => moment().format(ISO_DATE_FORMAT));
    const [selectedStructureValue, setSelectedStructureValue] = React.useState<string | null>(
      () => getSelectedStructure(userStructures)?.UAI ?? null,
    );
    const [isOpen, setIsOpen] = React.useState<boolean>(false);
    const [isDinner, setIsDinner] = React.useState<boolean>(false);

    const { dinnerMenu, error, load, loading, menu } = useCantineMenu(
      session.user.id,
      selectedStructureValue ?? undefined,
      selectedDate,
    );

    React.useEffect(() => {
      setIsDinner(false);
      load();
    }, [load]);

    const onMealChange = React.useCallback((index?: number) => setIsDinner(index === DINNER_SEGMENT), []);

    const mealSegments = React.useMemo(
      () => [
        { id: 'lunch', text: I18n.get('widget-cantine-meal-lunch') },
        { id: 'dinner', text: I18n.get('widget-cantine-meal-dinner') },
      ],
      [],
    );

    const onStructureChange = React.useCallback(
      (callback: (value: string | null) => string | null) => {
        const newValue = callback(selectedStructureValue);
        setSelectedStructureValue(newValue);
        if (newValue) selectedStructureStorage.write(newValue);
      },
      [selectedStructureValue],
    );

    const renderPickers = () => (
      <View style={styles.contentHeader}>
        {dropdownItemsStructures.length > 1 && (
          <DropdownPicker
            open={isOpen}
            value={selectedStructureValue}
            items={dropdownItemsStructures}
            setOpen={setIsOpen}
            setValue={onStructureChange}
            placeholder={I18n.get('widget-cantine-home-select-structure')}
            style={styles.dropdownContainer}
          />
        )}
        <DayPicker
          onDateChange={date => {
            setSelectedDate(date.format(ISO_DATE_FORMAT));
          }}
          initialSelectedDate={moment(selectedDate)}
          style={styles.dayPicker}
          key={selectedDate} // the picker only reads its initial date.
        />
      </View>
    );

    const daySwipe = useDaySwipe(selectedDate, setSelectedDate);

    const renderMealSegments = () =>
      dinnerMenu && menu.length ? (
        <View style={styles.mealSegments}>
          <SegmentedControl
            initialSelectedIndex={LUNCH_SEGMENT}
            key={selectedDate}
            matchParentWidth
            onChange={onMealChange}
            segments={mealSegments}
          />
        </View>
      ) : null;

    const renderLoaded = () => (
      <>
        <MenuSteps menuItems={isDinner && dinnerMenu ? dinnerMenu : menu} showAllergens />
        <MenuLegend />
      </>
    );

    const renderMenuContent = () => {
      if (loading) return <MenuStepsPlaceholder />;
      if (error) return <WidgetMessage illustration="illu-error" text={I18n.get('widget-cantine-widget-error-text')} />;
      if (!menu.length) return <WidgetMessage illustration="illu-error" text={I18n.get('widget-cantine-widget-empty-text')} />;
      return renderLoaded();
    };

    const inner = (
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          {renderPickers()}
          {renderMealSegments()}
          <GestureDetector gesture={daySwipe.gesture}>
            <Animated.View style={[styles.menuWrapper, daySwipe.style]}>{renderMenuContent()}</Animated.View>
          </GestureDetector>
        </View>
      </View>
    );

    if (embedded && noScroll) return inner;

    return (
      <ScrollView bottomInset={false} contentContainerStyle={styles.scrollContent}>
        {inner}
      </ScrollView>
    );
  },
);

export default CantineHomeScreen;
