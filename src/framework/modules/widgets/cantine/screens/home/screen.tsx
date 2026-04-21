import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import moment from 'moment';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';

import { I18n } from '~/app/i18n';
import { EmptyScreen } from '~/framework/components/empty-screens';
import { PageView } from '~/framework/components/page';
import DayPicker from '~/framework/components/pickers/day';
import DropdownPicker from '~/framework/components/pickers/dropdown';
import ScrollView from '~/framework/components/scrollView';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import { getSession } from '~/framework/modules/auth/redux/reducer';
import MenuCard from '~/framework/modules/widgets/cantine/components/MenuCard';
import { CantineData } from '~/framework/modules/widgets/cantine/model';
import { CantineNavigationParams, cantineRouteNames } from '~/framework/modules/widgets/cantine/navigation';
import { actions, getCacheKey, getCantineData, shouldRetryCantineData } from '~/framework/modules/widgets/cantine/reducer';
import { navBarOptions } from '~/framework/navigation/navBar';
import { sessionFetch } from '~/framework/util/transport';
import { Loading } from '~/ui/Loading';

import styles from './styles';
import { SwipeDirection } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<CantineNavigationParams, typeof cantineRouteNames.home>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('widget-cantine-home-title'),
  }),
});

export default function CantineHomeScreen({ embedded = false, noScroll = false }: { embedded?: boolean; noScroll?: boolean }) {
  const dispatch = useDispatch();
  const session = getSession();
  const userStructures = session?.user?.structures || [];

  // Convert structures to DropDownPicker format
  const dropdownItemsStructures = userStructures.map(structure => ({
    label: structure.name,
    value: structure.UAI,
  }));

  // Set default structure to the first one if available
  const defaultStructure = dropdownItemsStructures.length > 0 ? dropdownItemsStructures[0] : null;
  const defaultStructureValue = defaultStructure?.value || null;

  // default date is today
  const [selectedDate, setSelectedDate] = React.useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  });
  const [selectedStructureValue, setSelectedStructureValue] = React.useState<string | null>(defaultStructureValue);
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [selectedMeal, setSelectedMeal] = React.useState<'lunch' | 'dinner'>('lunch');

  // Get data from Redux store
  const cantineInfo = useSelector((state: any) =>
    selectedStructureValue ? getCantineData(state, selectedStructureValue, selectedDate) : null,
  );
  const shouldRetry = useSelector((state: any) =>
    selectedStructureValue ? shouldRetryCantineData(state, selectedStructureValue, selectedDate) : true,
  );

  const getCantineInfo = async () => {
    if (!selectedStructureValue) {
      console.warn('No structure selected');
      return;
    }

    const cacheKey = getCacheKey(selectedStructureValue, selectedDate);

    // Check if we should retry (no data cached or previous result was empty)
    if (!shouldRetry) {
      return;
    }

    setIsLoading(true);
    try {
      const cantineInfoResponse = await sessionFetch.json<CantineData>(
        `/appregistry/${selectedStructureValue}/cantine/menu?date=${selectedDate}`,
      );

      // Check if the response has menu items
      if (cantineInfoResponse && cantineInfoResponse.menu && cantineInfoResponse.menu.length > 0) {
        // Cache the data only if it has menu items
        dispatch(actions.setData(cacheKey, cantineInfoResponse));
      } else {
        // Don't cache empty results, just mark as empty so we can retry later
        dispatch(actions.setEmptyResult(cacheKey));
      }
    } catch (fetchError) {
      // Don't cache errors, treat them the same as empty results
      dispatch(actions.setEmptyResult(cacheKey));
      console.error('Error getting cantine info:', fetchError);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (selectedDate.length === 0 || !selectedStructureValue) {
      return;
    }
    setSelectedMeal('lunch');
    getCantineInfo();
  }, [selectedDate, selectedStructureValue]);

  const onStructureChange = React.useCallback(
    (callback: (value: string | null) => string | null) => {
      const newValue = callback(selectedStructureValue);
      setSelectedStructureValue(newValue);
    },
    [selectedStructureValue],
  );

  const renderContent = () => (
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
          setSelectedDate(date.format('YYYY-MM-DD'));
        }}
        initialSelectedDate={moment(selectedDate)}
        key={selectedDate} // Force re-render when date changes
      />
    </View>
  );

  const handleSwipe = (direction: SwipeDirection) => {
    const current = selectedDate;
    const dayOfWeek = moment(current).day();
    const step =
      (direction === SwipeDirection.LEFT && dayOfWeek === 6) || (direction === SwipeDirection.RIGHT && dayOfWeek === 1) ? 2 : 1;
    const newDate =
      direction === SwipeDirection.LEFT
        ? moment(current).add(step, 'day').format('YYYY-MM-DD')
        : moment(current).subtract(step, 'day').format('YYYY-MM-DD');
    setSelectedDate(newDate);
  };

  const panGesture = Gesture.Pan()
    .minDistance(50)
    .activeOffsetX([-10, 10])
    .onEnd(event => {
      if (event.translationX < -50) {
        runOnJS(handleSwipe)(SwipeDirection.LEFT);
      } else if (event.translationX > 50) {
        runOnJS(handleSwipe)(SwipeDirection.RIGHT);
      }
    });

  const renderMenuContent = () => {
    if (isLoading) {
      return <Loading />;
    }

    if (cantineInfo && cantineInfo.menu.length > 0) {
      const menuItems = selectedMeal === 'dinner' && cantineInfo.dinnerMenu ? cantineInfo.dinnerMenu : cantineInfo.menu;
      return (
        <>
          {cantineInfo.dinnerAvailable && (
            <View style={styles.mealSwitcher}>
              <TouchableOpacity
                style={[
                  styles.mealSwitcherItem,
                  selectedMeal === 'lunch' ? styles.mealSwitcherItemActive : styles.mealSwitcherItemInactive,
                ]}
                onPress={() => setSelectedMeal('lunch')}>
                {selectedMeal === 'lunch' ? (
                  <SmallBoldText style={styles.mealSwitcherText}>{I18n.get('widget-cantine-meal-lunch')}</SmallBoldText>
                ) : (
                  <SmallText style={styles.mealSwitcherText}>{I18n.get('widget-cantine-meal-lunch')}</SmallText>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.mealSwitcherItem,
                  selectedMeal === 'dinner' ? styles.mealSwitcherItemActive : styles.mealSwitcherItemInactive,
                ]}
                onPress={() => setSelectedMeal('dinner')}>
                {selectedMeal === 'dinner' ? (
                  <SmallBoldText style={styles.mealSwitcherText}>{I18n.get('widget-cantine-meal-dinner')}</SmallBoldText>
                ) : (
                  <SmallText style={styles.mealSwitcherText}>{I18n.get('widget-cantine-meal-dinner')}</SmallText>
                )}
              </TouchableOpacity>
            </View>
          )}
          <MenuCard menuItems={menuItems} />
        </>
      );
    }

    // Show empty screen if no data is cached
    // This handles both truly empty results, errors, and cases where we haven't fetched yet
    return <EmptyScreen svgImage="empty-search" title={I18n.get('widget-cantine-home-empty-title')} />;
  };

  const inner = (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {renderContent()}
        <GestureDetector gesture={panGesture}>
          <View style={styles.menuWrapper}>{renderMenuContent()}</View>
        </GestureDetector>
      </View>
    </View>
  );

  if (embedded) return noScroll ? inner : <ScrollView bottomInset={false}>{inner}</ScrollView>;

  return (
    <PageView>
      <ScrollView bottomInset={false}>{inner}</ScrollView>
    </PageView>
  );
}
