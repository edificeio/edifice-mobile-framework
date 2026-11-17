import * as React from 'react';
import { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, View } from 'react-native';

import { Temporal } from '@js-temporal/polyfill';
import { FlashListRef } from '@shopify/flash-list';
import moment from 'moment';
import { GestureDetector } from 'react-native-gesture-handler';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';

import { I18n } from '~/app/i18n';
import { modalScreenOptions } from '~/app/navigation/util';
import { UI_SIZES } from '~/framework/components/constants';
import DayPicker from '~/framework/components/pickers/day';
import DropdownPicker from '~/framework/components/pickers/dropdown';
import SegmentedControl from '~/framework/components/segmented-control';
import type { StepperRow } from '~/framework/components/stepper';
import { withSession } from '~/framework/modules/auth/util';
import { DaySwipeCell, DaySwipeProvider } from '~/framework/modules/widgets/cantine/components/day-swipe-cell';
import { MenuLegend, MenuSteps, MenuStepsPlaceholder } from '~/framework/modules/widgets/cantine/components/menu';
import { useDaySwipe } from '~/framework/modules/widgets/cantine/hooks/day-swipe';
import { useCantineMenu } from '~/framework/modules/widgets/cantine/hooks/menu';
import { useCantineStructure } from '~/framework/modules/widgets/cantine/hooks/structure';
import type { MenuItem } from '~/framework/modules/widgets/cantine/model';
import { WidgetMessage } from '~/framework/modules/widgets/components/message';
import { momentToPlainDate } from '~/framework/util/date';

import styles from './styles';

const LUNCH_SEGMENT = 0;
const DINNER_SEGMENT = 1;
// frames to wait for the new day to be tall enough to restore the scroll.
const DAY_OFFSET_MAX_FRAMES = 30;

export const computeNavBar = modalScreenOptions('modal', () => ({ title: I18n.get('widget-cantine-home-title') }));

const CantineHomeScreen = withSession<{ embedded?: boolean; noScroll?: boolean }>(
  ({ embedded = false, noScroll = false, session }) => {
    const [selectedDate, setSelectedDate] = React.useState<Temporal.PlainDate>(() => Temporal.Now.plainDateISO());

    const headerHeight = useSharedValue(0);
    const scrollY = useSharedValue(0);
    // scroll offset that puts the meal segments, or the menu without them, at the top.
    const menuAnchor = React.useRef<number>(0);
    const getMenuOnTopOffset = React.useCallback(() => Math.min(scrollY.value, menuAnchor.current), [scrollY]);
    // offset to restore once the new day is displayed.
    const dayOffset = React.useRef<number | null>(null);

    const menuListRef = React.useRef<FlashListRef<StepperRow<MenuItem>>>(null);
    const selectDate = React.useCallback(
      (date: Temporal.PlainDate) => {
        // the day picker also calls back with the current day when it mounts.
        if (date.equals(selectedDate)) return;
        dayOffset.current = getMenuOnTopOffset();
        // placed right away so the header does not move while the new day loads.
        menuListRef.current?.scrollToOffset({ animated: false, offset: dayOffset.current });
        setSelectedDate(date);
      },
      [getMenuOnTopOffset, selectedDate],
    );
    const selectedDay = selectedDate.toString();
    const { cantineStructures, select: selectStructure, structure } = useCantineStructure(session.user.structures);
    const dropdownItemsStructures = cantineStructures.map(s => ({ label: s.name, value: s.UAI }));
    const selectedStructureValue = structure?.UAI ?? null;
    const [isOpen, setIsOpen] = React.useState<boolean>(false);
    const [isDinner, setIsDinner] = React.useState<boolean>(false);

    const { dinnerItems, isError, isLoading, loadMenu, lunchItems } = useCantineMenu(structure?.UAI, selectedDate);

    React.useEffect(() => {
      setIsDinner(false);
      loadMenu();
    }, [loadMenu]);

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
        if (newValue) selectStructure(newValue);
      },
      [selectStructure, selectedStructureValue],
    );

    // while the new day loads, the segments of the previous day stay so the header keeps its height.
    const [hasMealSegments, setHasMealSegments] = React.useState<boolean>(false);
    React.useEffect(() => {
      if (!isLoading) setHasMealSegments(Boolean(dinnerItems && lunchItems.length));
    }, [dinnerItems, isLoading, lunchItems.length]);
    // the loading placeholder is at least as tall as the list, so the header can stay up.
    const [menuHeight, setMenuHeight] = React.useState<number>(0);
    const onMenuLayout = React.useCallback((event: LayoutChangeEvent) => setMenuHeight(event.nativeEvent.layout.height), []);
    const loadingStyle = React.useMemo(() => ({ minHeight: menuHeight }), [menuHeight]);

    const menuTop = useDerivedValue(() => headerHeight.value - scrollY.value);
    const onHeaderLayout = React.useCallback(
      (event: LayoutChangeEvent) => {
        const headerBottom = event.nativeEvent.layout.y + event.nativeEvent.layout.height;
        headerHeight.value = headerBottom;
        if (!hasMealSegments) menuAnchor.current = headerBottom;
      },
      [hasMealSegments, headerHeight],
    );
    const onMealSegmentsLayout = React.useCallback((event: LayoutChangeEvent) => {
      menuAnchor.current = event.nativeEvent.layout.y - UI_SIZES.spacing.medium;
    }, []);
    const onMenuScroll = React.useCallback(
      (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        scrollY.value = event.nativeEvent.contentOffset.y;
      },
      [scrollY],
    );

    // bring the menu start up only when it has scrolled out of sight.
    React.useEffect(() => {
      const offset = getMenuOnTopOffset();
      if (offset < scrollY.value) menuListRef.current?.scrollToOffset({ animated: true, offset });
    }, [getMenuOnTopOffset, isDinner, scrollY]);
    // the list shrinks while the new day loads, so the offset is restored afterwards.
    // android stops at the content height it knows, so it is tried again on the next frames.
    React.useEffect(() => {
      if (isLoading) return;
      let frame = 0;
      let frameId: number | undefined;
      const restore = () => {
        const offset = dayOffset.current;
        if (offset === null) return;
        if (Math.abs(scrollY.value - offset) < 1 || frame++ >= DAY_OFFSET_MAX_FRAMES) {
          dayOffset.current = null;
          return;
        }
        menuListRef.current?.scrollToOffset({ animated: false, offset });
        frameId = requestAnimationFrame(restore);
      };
      restore();
      return () => {
        if (frameId !== undefined) cancelAnimationFrame(frameId);
      };
    }, [isLoading, scrollY, selectedDay]);
    // the user scrolls by hand, the offset to restore no longer matters.
    const onMenuScrollBeginDrag = React.useCallback(() => {
      dayOffset.current = null;
    }, []);

    const renderPickers = () => (
      <>
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
            selectDate(momentToPlainDate(date));
          }}
          initialSelectedDate={moment(selectedDay)}
          style={styles.dayPicker}
          key={selectedDay} // the picker only reads its initial date.
        />
      </>
    );

    const daySwipe = useDaySwipe(selectedDate, selectDate, menuTop);

    const renderMealSegments = () =>
      hasMealSegments ? (
        <View style={styles.mealSegments} onLayout={onMealSegmentsLayout}>
          <SegmentedControl
            initialSelectedIndex={LUNCH_SEGMENT}
            key={selectedDay}
            matchParentWidth
            onChange={onMealChange}
            segments={mealSegments}
          />
        </View>
      ) : null;

    const isLoaded = !isLoading && !isError && lunchItems.length > 0;
    const mealItems = isDinner && dinnerItems ? dinnerItems : lunchItems;

    const renderStatus = () => {
      if (isLoading)
        return (
          <View style={loadingStyle}>
            <MenuStepsPlaceholder />
          </View>
        );
      if (isError) return <WidgetMessage illustration="illu-error" text={I18n.get('widget-cantine-widget-error-text')} />;
      return <WidgetMessage illustration="illu-error" text={I18n.get('widget-cantine-widget-empty-text')} />;
    };

    const renderHeader = () => (
      <View style={styles.headerContent} onLayout={onHeaderLayout}>
        {renderPickers()}
        {renderMealSegments()}
      </View>
    );

    return (
      <DaySwipeProvider value={daySwipe.style}>
        <GestureDetector gesture={daySwipe.gesture}>
          <View style={styles.menuWrapper} onLayout={onMenuLayout}>
            <MenuSteps
              ref={menuListRef}
              menuItems={isLoaded ? mealItems : []}
              showAllergens
              scrollEnabled={!(embedded && noScroll)}
              contentContainerStyle={styles.menuContent}
              ListHeaderComponent={renderHeader()}
              ListHeaderComponentStyle={styles.header}
              ListEmptyComponent={renderStatus()}
              ListFooterComponent={isLoaded ? <MenuLegend /> : null}
              CellRendererComponent={DaySwipeCell}
              onScroll={onMenuScroll}
              onScrollBeginDrag={onMenuScrollBeginDrag}
              scrollEventThrottle={16}
            />
          </View>
        </GestureDetector>
      </DaySwipeProvider>
    );
  },
);

export default CantineHomeScreen;
