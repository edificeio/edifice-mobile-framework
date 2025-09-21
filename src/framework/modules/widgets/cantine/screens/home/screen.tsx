import * as React from 'react';
import { View } from 'react-native';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import moment from 'moment';
import DropDownPicker from 'react-native-dropdown-picker';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';

import styles from './styles';

import { I18n } from '~/app/i18n';
import { EmptyScreen } from '~/framework/components/empty-screens';
import { PageView } from '~/framework/components/page';
import DayPicker from '~/framework/components/pickers/day';
import ScrollView from '~/framework/components/scrollView';
import { getPlatform, getSession } from '~/framework/modules/auth/reducer';
import MenuCard from '~/framework/modules/widgets/cantine/components/MenuCard';
import { CantineData } from '~/framework/modules/widgets/cantine/model';
import { CantineNavigationParams, cantineRouteNames } from '~/framework/modules/widgets/cantine/navigation';
import { actions, getCacheKey, getCantineData, shouldRetryCantineData } from '~/framework/modules/widgets/cantine/reducer';
import { navBarOptions } from '~/framework/navigation/navBar';
import { signedFetchJson } from '~/infra/fetchWithCache';
import { Loading } from '~/ui/Loading';

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
      const cantineInfoResponse = (await signedFetchJson(
        `${getPlatform()?.url}/appregistry/${selectedStructureValue}/cantine/menu?date=${selectedDate}`,
      )) as CantineData;

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

    getCantineInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, selectedStructureValue]);

  const onStructureChange = React.useCallback(
    (callback: (value: string | null) => string | null) => {
      const newValue = callback(selectedStructureValue);
      setSelectedStructureValue(newValue);
    },
    [selectedStructureValue],
  );

  const renderContent = () => (
    <View>
      {dropdownItemsStructures.length > 1 && (
        <DropDownPicker
          open={isOpen}
          value={selectedStructureValue}
          items={dropdownItemsStructures}
          setOpen={setIsOpen}
          setValue={onStructureChange}
          placeholder={I18n.get('widget-cantine-home-select-structure')}
          style={styles.dropdownContainer}
          dropDownContainerStyle={styles.dropdownContainer}
          textStyle={styles.dropdownText}
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

  const handleSwipe = (direction: 'left' | 'right') => {
    const current = selectedDate;
    const newDate =
      direction === 'left'
        ? moment(current).add(1, 'day').format('YYYY-MM-DD')
        : moment(current).subtract(1, 'day').format('YYYY-MM-DD');
    setSelectedDate(newDate);
  };

  const panGesture = Gesture.Pan()
    .minDistance(50)
    .activeOffsetX([-10, 10])
    .onEnd(event => {
      if (event.translationX < -50) {
        runOnJS(handleSwipe)('left');
      } else if (event.translationX > 50) {
        runOnJS(handleSwipe)('right');
      }
    });

  const renderMenuContent = () => {
    if (isLoading) {
      return <Loading />;
    }

    if (cantineInfo && cantineInfo.menu.length > 0) {
      return <MenuCard menuItems={cantineInfo.menu} />;
    }

    // Show empty screen if no data is cached
    // This handles both truly empty results, errors, and cases where we haven't fetched yet
    return (
      <View>
        <EmptyScreen svgImage="empty-search" title={I18n.get('widget-cantine-home-empty-title')} />
      </View>
    );
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
