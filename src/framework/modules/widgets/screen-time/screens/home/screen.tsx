import * as React from 'react';
import { FlatList, View } from 'react-native';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import moment from 'moment';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import styles from './styles';

import { I18n } from '~/app/i18n';
import TertiaryButton from '~/framework/components/buttons/tertiary';
import DateTimePicker from '~/framework/components/dateTimePicker';
import { EmptyScreen } from '~/framework/components/empty-screens';
import BottomSheetModal, { type BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import ScrollView from '~/framework/components/scrollView';
import SegmentedControl from '~/framework/components/segmented-control';
import { BodyText } from '~/framework/components/text';
import UserList from '~/framework/components/UserList';
import { withSession } from '~/framework/modules/auth/util';
import { useSelectedChild } from '~/framework/modules/widgets/hooks';
import { BarChart } from '~/framework/modules/widgets/screen-time/components/BarChart';
import { ScreenTimeDuration } from '~/framework/modules/widgets/screen-time/components/duration';
import WeekPicker from '~/framework/modules/widgets/screen-time/components/WeekPicker';
import { useScreenTimeUsers } from '~/framework/modules/widgets/screen-time/hooks/screen-time';
import { ScreenTimeDayResponse, ScreenTimeWeekResponse } from '~/framework/modules/widgets/screen-time/model';
import { ScreenTimeNavigationParams, screenTimeRouteNames } from '~/framework/modules/widgets/screen-time/navigation';
import { screenTimeService } from '~/framework/modules/widgets/screen-time/service';
import { selectedChildStorage } from '~/framework/modules/widgets/screen-time/storage';
import { navBarOptions } from '~/framework/navigation/navBar';

const WEEK_SEGMENT = 0;
const DAY_SEGMENT = 1;

const parseDate = (date: string | moment.Moment) => {
  if (date === 'today') return moment();
  if (date === 'yesterday') return moment().subtract(1, 'day');
  if (moment.isMoment(date)) return date;
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? moment(date) : undefined;
};

const parseWeek = (date: string | moment.Moment, shown: moment.Moment) => (moment.isMoment(date) ? date : shown);

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<ScreenTimeNavigationParams, typeof screenTimeRouteNames.home>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('widget-screen-time-home-title'),
  }),
});

const ScreenTimeHomeScreen = withSession<{ embedded?: boolean; noScroll?: boolean }>(
  ({ embedded = false, noScroll = false, session }) => {
    const { bottom: bottomSafeArea } = useSafeAreaInsets();
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [todayData, setTodayData] = React.useState<ScreenTimeDayResponse | null>(null);
    const [yesterdayData, setYesterdayData] = React.useState<ScreenTimeDayResponse | null>(null);
    const [weekData, setWeekData] = React.useState<ScreenTimeWeekResponse | null>(null);
    const [selectedWeek, setSelectedWeek] = React.useState<moment.Moment>(moment().startOf('week'));
    const [isDayMode, setIsDayMode] = React.useState<boolean>(false);
    const [selectedDay, setSelectedDay] = React.useState<string | null>(moment().format('YYYY-MM-DD'));
    const [selectedDayData, setSelectedDayData] = React.useState<ScreenTimeDayResponse | null>(null);
    const selectedDate = React.useMemo(() => (selectedDay ? moment(selectedDay) : moment()), [selectedDay]);

    const infoSheetRef = React.useRef<BottomSheetModalMethods>(null);
    const childrenListRef = React.useRef<FlatList>(null);
    // Refs to track current request context and prevent stale updates
    const currentRequestRef = React.useRef<{
      childId: string | null;
      todayDate: string;
      yesterdayDate: string;
    } | null>(null);
    const currentWeekRequestRef = React.useRef<{
      childId: string | null;
      weekKey: string;
    } | null>(null);
    const currentDayRequestRef = React.useRef<{
      childId: string | null;
      day: string;
    } | null>(null);

    const userChildren = useScreenTimeUsers(session);

    const { select, selected } = useSelectedChild(userChildren, selectedChildStorage);
    const selectedChildId = selected?.id ?? null;

    // Reset all data when child selection changes
    React.useEffect(() => {
      // Reset all data states immediately when child changes
      setTodayData(null);
      setYesterdayData(null);
      setWeekData(null);
      setSelectedDayData(null);
      // Reset view states
      setSelectedDay(moment().format('YYYY-MM-DD'));
      setSelectedWeek(moment().startOf('week'));
      setIsDayMode(false);
      // Clear request refs to invalidate any in-flight requests
      currentRequestRef.current = null;
      currentWeekRequestRef.current = null;
      currentDayRequestRef.current = null;
    }, [selectedChildId]);

    const handleWeekChange = React.useCallback((weekStart: moment.Moment) => {
      setSelectedWeek(weekStart);
      setSelectedDay(weekStart.clone().startOf('week').format('YYYY-MM-DD'));
    }, []);

    const getScreenTime = React.useCallback(
      async (date: string | moment.Moment, isWeek = false): Promise<ScreenTimeDayResponse | ScreenTimeWeekResponse | null> => {
        if (!selectedChildId) return null;

        try {
          if (isWeek) return (await screenTimeService.week(selectedChildId, parseWeek(date, selectedWeek))) ?? null;

          const day = parseDate(date);
          return day ? ((await screenTimeService.day(selectedChildId, day)) ?? null) : null;
        } catch (error) {
          console.error('Error fetching screen time:', error);
          return null;
        }
      },

      // eslint-disable-next-line react-hooks/exhaustive-deps
      [selectedChildId],
    );

    // Fetch initial data when child selection changes
    React.useEffect(() => {
      const fetchData = async () => {
        if (!selectedChildId) return;

        // Capture current context at the start of the request
        const todayDate = moment().format('YYYY-MM-DD');
        const yesterdayDate = moment().subtract(1, 'day').format('YYYY-MM-DD');
        const requestContext = {
          childId: selectedChildId,
          todayDate,
          yesterdayDate,
        };
        currentRequestRef.current = requestContext;

        setIsLoading(true);
        try {
          const [todayResponse, yesterdayResponse] = await Promise.all([
            getScreenTime('today', false),
            getScreenTime('yesterday', false),
          ]);

          // Only update state if the request context still matches (child and dates haven't changed)
          if (
            currentRequestRef.current &&
            currentRequestRef.current.childId === selectedChildId &&
            currentRequestRef.current.todayDate === moment().format('YYYY-MM-DD') &&
            currentRequestRef.current === requestContext
          ) {
            if (todayResponse) {
              setTodayData(todayResponse as ScreenTimeDayResponse);
            }
            if (yesterdayResponse) {
              setYesterdayData(yesterdayResponse as ScreenTimeDayResponse);
            }
          }
        } catch (error) {
          console.error('Error getting screen time:', error);
        } finally {
          // Only update loading state if this is still the current request
          if (currentRequestRef.current === requestContext) {
            setIsLoading(false);
          }
        }
      };
      fetchData();

      // Cleanup: invalidate this request when effect re-runs or unmounts
      return () => {
        if (currentRequestRef.current?.childId === selectedChildId) {
          currentRequestRef.current = null;
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedChildId]);

    // Fetch week data when selected week changes (without loading state)
    React.useEffect(() => {
      // Capture values at the start of the effect for cleanup
      const currentChildId = selectedChildId;
      const currentWeekKey = selectedWeek ? selectedWeek.clone().startOf('week').format('YYYY-MM-DD') : null;

      const fetchWeekData = async () => {
        if (!selectedChildId || !selectedWeek) return;

        // Capture current context at the start of the request
        const weekKey = selectedWeek.clone().startOf('week').format('YYYY-MM-DD');
        const requestContext = {
          childId: selectedChildId,
          weekKey,
        };
        currentWeekRequestRef.current = requestContext;

        try {
          const weekResponse = await getScreenTime(selectedWeek, true);
          // Only update state if the request context still matches (child and week haven't changed)
          if (
            currentWeekRequestRef.current &&
            currentWeekRequestRef.current.childId === selectedChildId &&
            currentWeekRequestRef.current.weekKey === selectedWeek.clone().startOf('week').format('YYYY-MM-DD') &&
            currentWeekRequestRef.current === requestContext
          ) {
            if (weekResponse) {
              setWeekData(weekResponse as ScreenTimeWeekResponse);
            }
          }
        } catch (error) {
          console.error('Error getting week screen time:', error);
        }
      };
      fetchWeekData();

      // Cleanup: invalidate this request when effect re-runs or unmounts
      return () => {
        if (
          currentWeekRequestRef.current?.childId === currentChildId &&
          currentWeekRequestRef.current?.weekKey === currentWeekKey
        ) {
          currentWeekRequestRef.current = null;
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedChildId, selectedWeek]);

    // When switching to day mode or changing selected day, fetch that day's data
    React.useEffect(() => {
      // Capture values at the start of the effect for cleanup
      const currentChildId = selectedChildId;
      const currentDay = selectedDay;

      const fetchDayData = async () => {
        if (!selectedChildId || !selectedDay) return;

        // Capture current context at the start of the request
        const requestContext = {
          childId: selectedChildId,
          day: selectedDay,
        };
        currentDayRequestRef.current = requestContext;

        try {
          const dayResponse = await getScreenTime(selectedDay, false);
          // Only update state if the request context still matches (child and day haven't changed)
          if (
            currentDayRequestRef.current &&
            currentDayRequestRef.current.childId === selectedChildId &&
            currentDayRequestRef.current.day === selectedDay &&
            currentDayRequestRef.current === requestContext
          ) {
            if (dayResponse) {
              setSelectedDayData(dayResponse as ScreenTimeDayResponse);
            }
          }
        } catch (error) {
          console.error('Error getting selected day screen time:', error);
        }
      };
      fetchDayData();

      // Cleanup: invalidate this request when effect re-runs or unmounts
      return () => {
        if (currentDayRequestRef.current?.childId === currentChildId && currentDayRequestRef.current?.day === currentDay) {
          currentDayRequestRef.current = null;
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedChildId, selectedDay]);

    const handleDateChange = React.useCallback((date: moment.Moment) => {
      setSelectedDay(date.format('YYYY-MM-DD'));
      setSelectedWeek(date.clone().startOf('week'));
    }, []);

    const handleInfoPress = React.useCallback(() => {
      infoSheetRef.current?.present();
    }, []);

    const handleModeChange = React.useCallback((index?: number) => setIsDayMode(index === DAY_SEGMENT), []);

    const modeSegments = React.useMemo(
      () => [
        { id: 'week', text: I18n.get('widget-screen-time-week') },
        { id: 'day', text: I18n.get('widget-screen-time-day') },
      ],
      [],
    );

    const selectedChildIndex = userChildren.findIndex(child => child.id === selectedChildId);

    const scrollToSelectedChild = React.useCallback(() => {
      if (selectedChildIndex < 0) return;
      requestAnimationFrame(() => childrenListRef.current?.scrollToIndex({ index: selectedChildIndex, viewPosition: 0.5 }));
    }, [selectedChildIndex]);

    React.useEffect(scrollToSelectedChild, [scrollToSelectedChild]);

    const renderContentInner = () => {
      return (
        <View style={styles.container}>
          {userChildren.length === 0 && <EmptyScreen svgImage="empty-search" title={I18n.get('widget-screen-time-empty-title')} />}
          {userChildren.length > 0 && (
            <View style={styles.contentContainer}>
              {userChildren.length > 1 && (
                <UserList
                  ref={childrenListRef}
                  horizontal
                  data={userChildren}
                  selectedId={selectedChildId ?? undefined}
                  onSelect={select}
                  onContentSizeChange={scrollToSelectedChild}
                  style={styles.users}
                  contentContainerStyle={styles.usersContent}
                  bottomInset={false}
                />
              )}

              <View style={styles.summary}>
                <ScreenTimeDuration
                  today={todayData ?? undefined}
                  yesterday={yesterdayData ?? undefined}
                  isLoadingValues={isLoading}
                />
              </View>

              <TertiaryButton
                iconLeft="ui-infoCircle"
                iconRight="ui-rafterRight"
                text={I18n.get('widget-screen-time-view-details')}
                action={handleInfoPress}
                style={styles.info}
                testID="screen-time-info"
              />
              {/* Separator */}
              <View style={styles.separator} />
              {/* View mode toggle */}
              <View style={styles.modeToggleContainer}>
                <SegmentedControl
                  matchParentWidth
                  segments={modeSegments}
                  initialSelectedIndex={WEEK_SEGMENT}
                  onChange={handleModeChange}
                />
              </View>
              {/* Week/Day selector */}
              {!isDayMode ? (
                <WeekPicker selectedWeekStart={selectedWeek} onWeekChange={handleWeekChange} />
              ) : (
                <View style={styles.datePickerContainer}>
                  <DateTimePicker mode="date" value={selectedDate} onChangeValue={handleDateChange} style={styles.datePicker} />
                </View>
              )}
              {/* Conditionally render week chart or day details */}
              {!isDayMode ? <BarChart type="week" data={weekData} /> : <BarChart type="day" data={selectedDayData} />}
            </View>
          )}
        </View>
      );
    };

    const infoSheet = (
      <BottomSheetModal ref={infoSheetRef} closeButton>
        <BodyText>{I18n.get('widget-screen-time-info-modal-text')}</BodyText>
      </BottomSheetModal>
    );

    const inner = renderContentInner();

    const scrollContentStyle = { paddingBottom: bottomSafeArea };

    if (embedded && noScroll)
      return (
        <React.Fragment>
          {inner}
          {infoSheet}
        </React.Fragment>
      );

    return (
      <React.Fragment>
        <ScrollView showsVerticalScrollIndicator={false} bottomInset={false} contentContainerStyle={scrollContentStyle}>
          {inner}
        </ScrollView>
        {infoSheet}
      </React.Fragment>
    );
  },
);

export default ScreenTimeHomeScreen;
