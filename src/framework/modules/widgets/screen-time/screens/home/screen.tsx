import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import moment from 'moment';

import styles from './styles';

import { I18n } from '~/app/i18n';
import IconButton from '~/framework/components/buttons/icon';
import DateTimePicker from '~/framework/components/dateTimePicker';
import { EmptyScreen } from '~/framework/components/empty-screens';
import { ModalBox, ModalBoxHandle } from '~/framework/components/ModalBox';
import { PageView } from '~/framework/components/page';
import DropdownPicker from '~/framework/components/pickers/dropdown';
import { BodyBoldText, TextFontStyle } from '~/framework/components/text';
import { AccountType, AuthActiveUserInfo, AuthActiveUserInfoRelative, getFlattenedChildren } from '~/framework/modules/auth/model';
import { getPlatform, getSession } from '~/framework/modules/auth/redux/reducer';
import { BarChart } from '~/framework/modules/widgets/screen-time/components/BarChart';
import { UsageCard } from '~/framework/modules/widgets/screen-time/components/UsageCard';
import WeekPicker from '~/framework/modules/widgets/screen-time/components/WeekPicker';
import { ScreenTimeDayResponse, ScreenTimeWeekResponse } from '~/framework/modules/widgets/screen-time/model';
import { ScreenTimeNavigationParams, screenTimeRouteNames } from '~/framework/modules/widgets/screen-time/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';
import { sessionFetch } from '~/framework/util/transport';
import HtmlContentView from '~/ui/HtmlContentView';
import { Loading } from '~/ui/Loading';

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

function ScreenTimeHomeScreen({ embedded = false, noScroll = false }: { embedded?: boolean; noScroll?: boolean }) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [todayData, setTodayData] = React.useState<ScreenTimeDayResponse | null>(null);
  const [yesterdayData, setYesterdayData] = React.useState<ScreenTimeDayResponse | null>(null);
  const [weekData, setWeekData] = React.useState<ScreenTimeWeekResponse | null>(null);
  const [selectedWeek, setSelectedWeek] = React.useState<moment.Moment>(moment().startOf('week'));
  const [isDayMode, setIsDayMode] = React.useState<boolean>(false);
  const [selectedDay, setSelectedDay] = React.useState<string | null>(moment().format('YYYY-MM-DD'));
  const [selectedDayData, setSelectedDayData] = React.useState<ScreenTimeDayResponse | null>(null);
  const selectedDate = React.useMemo(() => (selectedDay ? moment(selectedDay) : moment()), [selectedDay]);

  const infoModalRef = React.useRef<ModalBoxHandle>(null);
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

  const session = getSession();
  const isRelativeProfile = session?.user?.type === AccountType.Relative;

  const userChildren = React.useMemo(() => {
    const user = session?.user as AuthActiveUserInfoRelative | AuthActiveUserInfo | undefined;
    return getFlattenedChildren((user as AuthActiveUserInfoRelative | undefined)?.children) ?? [];
  }, [session?.user]);

  const [selectedChildId, setSelectedChildId] = React.useState<string | null>(() => {
    if (isRelativeProfile) {
      return userChildren.length > 0 ? userChildren[0].id : null;
    } else {
      // For non-relative profiles, use the current user's ID
      return session?.user?.id || null;
    }
  });

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

  const dropdownItems = React.useMemo(() => {
    return userChildren.map(child => ({
      label: `${child.firstName} ${child.lastName}`,
      value: child.id,
    }));
  }, [userChildren]);

  const handleWeekChange = React.useCallback((weekStart: moment.Moment) => {
    setSelectedWeek(weekStart);
    setSelectedDay(weekStart.clone().startOf('week').format('YYYY-MM-DD'));
  }, []);

  const getScreenTime = React.useCallback(
    async (date: string | moment.Moment, isWeek = false): Promise<ScreenTimeDayResponse | ScreenTimeWeekResponse | null> => {
      if (!selectedChildId) return null;

      const platformUrl = getPlatform()?.url;
      if (!platformUrl) return null;

      let url: string;
      const childId = selectedChildId;

      if (isWeek) {
        const week = date instanceof moment ? date : selectedWeek;
        const weekStartDate = week.clone().startOf('week').format('YYYY-MM-DD');
        const weekEndDate = week.clone().endOf('week').format('YYYY-MM-DD');
        url = `${platformUrl}/appregistry/screen-time/${childId}/weekly?startDate=${weekStartDate}&endDate=${weekEndDate}&mock=false`;
      } else {
        let dateString: string;
        if (date === 'today') {
          dateString = moment().format('YYYY-MM-DD');
        } else if (date === 'yesterday') {
          dateString = moment().subtract(1, 'day').format('YYYY-MM-DD');
        } else if (moment.isMoment(date)) {
          dateString = date.format('YYYY-MM-DD');
        } else if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
          dateString = date;
        } else {
          return null;
        }
        url = `${platformUrl}/appregistry/screen-time/${childId}/daily?date=${dateString}&mock=false`;
      }

      try {
        const response = await sessionFetch(url);

        if (response.ok) {
          return isWeek ? ((await response.json()) as ScreenTimeWeekResponse) : ((await response.json()) as ScreenTimeDayResponse);
        }

        return null;
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
      if (currentWeekRequestRef.current?.childId === currentChildId && currentWeekRequestRef.current?.weekKey === currentWeekKey) {
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
    infoModalRef.current?.doShowModal();
  }, []);

  const renderContentInner = () => {
    if (isLoading) {
      return <Loading />;
    }

    return (
      <View style={styles.container}>
        {userChildren.length === 0 && <EmptyScreen svgImage="empty-search" title={I18n.get('widget-screen-time-empty-title')} />}
        {userChildren.length > 0 && (
          <View style={styles.contentContainer}>
            {isRelativeProfile && (
              <DropdownPicker
                items={dropdownItems}
                value={selectedChildId}
                setValue={setSelectedChildId}
                open={isDropdownOpen}
                setOpen={setIsDropdownOpen}
                placeholder={I18n.get('widget-screen-time-select-child')}
                searchable={false}
                style={styles.dropdownPicker}
              />
            )}

            {/* Usage Cards */}
            <View style={styles.cardsContainer}>
              <UsageCard title={I18n.get('widget-screen-time-today')} data={todayData} variant="today" />
              <UsageCard title={I18n.get('widget-screen-time-yesterday')} data={yesterdayData} variant="yesterday" />
            </View>

            {/* Separator */}
            <View style={styles.separator} />

            {/* Affichage section */}
            <View style={styles.sectionTitleContainer}>
              <BodyBoldText style={styles.sectionTitle}>{I18n.get('widget-screen-time-view-details')}</BodyBoldText>
              <IconButton icon="ui-infoCircle" action={handleInfoPress} style={styles.infoIcon} size={20} />
            </View>
            {/* View mode toggle */}
            <View style={styles.modeToggleContainer}>
              <View style={styles.tabToggleBackground}>
                <View style={[styles.tabToggleIndicator, isDayMode && styles.tabToggleIndicatorRight]} />
                <Pressable onPress={() => setIsDayMode(false)} style={styles.tabToggleItem}>
                  <BodyBoldText style={styles.tabToggleText}>{I18n.get('widget-screen-time-week')}</BodyBoldText>
                </Pressable>
                <Pressable onPress={() => setIsDayMode(true)} style={styles.tabToggleItem}>
                  <BodyBoldText style={styles.tabToggleText}>{I18n.get('widget-screen-time-day')}</BodyBoldText>
                </Pressable>
              </View>
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

  const infoModalContent = (
    <View style={styles.modalContent}>
      <HtmlContentView
        html={I18n.get('widget-screen-time-info-modal-text')}
        opts={{
          audio: false,
          iframes: false,
          images: false,
          linkTextStyle: {
            ...TextFontStyle.Bold,
            textDecorationLine: 'underline',
          },
          textColor: false,
          video: false,
        }}
      />
    </View>
  );

  const inner = (
    <>
      {renderContentInner()}
      <ModalBox ref={infoModalRef} content={infoModalContent} />
    </>
  );

  if (embedded) return noScroll ? inner : <ScrollView showsVerticalScrollIndicator={false}>{inner}</ScrollView>;

  return <PageView>{<ScrollView showsVerticalScrollIndicator={false}>{inner}</ScrollView>}</PageView>;
}

export default ScreenTimeHomeScreen;
