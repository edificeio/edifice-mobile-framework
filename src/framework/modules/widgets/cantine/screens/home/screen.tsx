import * as React from 'react';
import { View } from 'react-native';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import moment from 'moment';
import DropDownPicker from 'react-native-dropdown-picker';

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

export default function CantineHomeScreen() {
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

  const [cantineInfo, setCantineInfo] = React.useState<CantineData | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  // default date is today
  const [selectedDate, setSelectedDate] = React.useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  });
  const [selectedStructureValue, setSelectedStructureValue] = React.useState<string | null>(defaultStructureValue);
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const getCantineInfo = async () => {
    if (!selectedStructureValue) {
      console.warn('No structure selected');
      return;
    }

    setIsLoading(true);
    try {
      const cantineInfoResponse = (await signedFetchJson(
        `${getPlatform()?.url}/appregistry/${selectedStructureValue}/cantine/menu?date=${selectedDate}`,
      )) as CantineData;

      setCantineInfo(cantineInfoResponse);
    } catch (error) {
      setCantineInfo(null);
      console.error('Error getting cantine info:', error);
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
      setCantineInfo(null); // Clear previous data when structure changes
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
          setCantineInfo(null);
          setSelectedDate(date.format('YYYY-MM-DD'));
        }}
        initialSelectedDate={moment(selectedDate)}
      />
    </View>
  );

  const renderMenuContent = () => {
    if (isLoading) {
      return <Loading />;
    }

    if (cantineInfo && cantineInfo.menu.length > 0) {
      return <MenuCard menuItems={cantineInfo.menu} />;
    }

    return (
      <View>
        <EmptyScreen svgImage="empty-content" title={I18n.get('widget-cantine-home-empty-title')} />
      </View>
    );
  };

  return (
    <PageView>
      <ScrollView bottomInset={false}>
        <View style={styles.container}>
          <View style={styles.contentContainer}>
            {renderContent()}
            {renderMenuContent()}
          </View>
        </View>
      </ScrollView>
    </PageView>
  );
}
