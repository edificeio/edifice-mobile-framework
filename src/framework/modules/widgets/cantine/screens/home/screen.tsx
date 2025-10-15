import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import moment from 'moment';

import styles from './styles';

import { I18n } from '~/app/i18n';
import SelectButton from '~/framework/components/buttons/select';
import { EmptyScreen } from '~/framework/components/empty-screens';
import { PageView } from '~/framework/components/page';
import DayPicker from '~/framework/components/pickers/day';
import ScrollView from '~/framework/components/scrollView';
import { BodyText } from '~/framework/components/text';
import { getPlatform, getSession } from '~/framework/modules/auth/reducer';
import MenuCard from '~/framework/modules/widgets/cantine/components/MenuCard';
import { CantineData, Structure } from '~/framework/modules/widgets/cantine/model';
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

  // Convert user structures to our Structure format
  const structures: Structure[] = userStructures.map(structure => ({
    name: structure.name,
    uai: structure.UAI,
  }));

  // Set default structure to the first one if available
  const defaultStructure = structures.length > 0 ? structures[0] : null;

  const [cantineInfo, setCantineInfo] = React.useState<CantineData | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  // default date is today
  const [selectedDate, setSelectedDate] = React.useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  });
  const [selectedStructure, setSelectedStructure] = React.useState<Structure | null>(defaultStructure);

  const getCantineInfo = async () => {
    if (!selectedStructure) {
      console.warn('No structure selected');
      return;
    }

    setIsLoading(true);
    try {
      const cantineInfoResponse = (await signedFetchJson(
        `${getPlatform()?.url}/appregistry/${selectedStructure.uai}/cantine/menu?date=${selectedDate}`,
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
    if (selectedDate.length === 0 || !selectedStructure) {
      return;
    }

    getCantineInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, selectedStructure]);

  const onStructurePress = React.useCallback((item: Structure) => {
    setSelectedStructure(item);
    setCantineInfo(null); // Clear previous data when structure changes
    // Handle structure selection if needed
  }, []);

  const renderStructureItem = React.useCallback(
    ({ item, onPress }: { item: Structure; onPress: () => void }) => (
      <TouchableOpacity onPress={onPress} style={styles.structureListItem}>
        <View style={styles.structureListItemContent}>
          <View style={styles.structureListItemHeader}>
            <BodyText numberOfLines={1} style={styles.structureListItemName}>
              {item.name}
            </BodyText>
          </View>
        </View>
      </TouchableOpacity>
    ),
    [],
  );

  const renderContent = () => (
    <View>
      {structures.length > 1 && (
        <SelectButton
          text={selectedStructure ? selectedStructure.name : I18n.get('widget-cantine-home-select-structure')}
          iconLeft="ui-school"
          iconRight="ui-unfold"
          wrapperStyle={styles.selectButtonWrapper}
          testID="widget-cantine-structure-select-button"
          data={structures}
          onItemPress={onStructurePress}
          renderItem={renderStructureItem}
          keyExtractor={item => `${item.name}-${item.uai}`}
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
