import * as React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import { MenuCard } from '../../components/MenuCard';
import { CantineData } from '../../model';

import { I18n } from '~/app/i18n';
// import { UI_SIZES } from '~/framework/components/constants';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import DayPicker from '~/framework/components/pickers/day';
import { BodyBoldText } from '~/framework/components/text';
import { getPlatform } from '~/framework/modules/auth/reducer';
import { CantineNavigationParams, cantineRouteNames } from '~/framework/modules/widgets/cantine/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';
import { signedFetchJson } from '~/infra/fetchWithCache';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: UI_SIZES.spacing.medium,
  },
  dayPicker: {
    borderColor: theme.palette.grey.stone,
    borderRadius: UI_SIZES.radius.selector,
    borderWidth: UI_SIZES.border.thin,
    marginBottom: UI_SIZES.spacing.medium,
    marginLeft: UI_SIZES.spacing.small,
    marginRight: UI_SIZES.spacing.small,
    marginTop: UI_SIZES.spacing.medium,
  },
  emptyContainer: {
    alignItems: 'center',
    backgroundColor: theme.palette.complementary.orange.pale,
    borderColor: theme.palette.complementary.orange.light,
    borderRadius: UI_SIZES.radius.small,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginLeft: UI_SIZES.spacing.tiny,
    marginTop: UI_SIZES.spacing.large,
    paddingHorizontal: UI_SIZES.spacing.tiny,
    paddingVertical: 2,
  },
  emptyTitle: {
    textAlign: 'center',
  },
});

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<CantineNavigationParams, typeof cantineRouteNames.home>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('cantine-home-title'),
  }),
});

export default function CantineHomeScreen() {
  const [cantineInfo, setCantineInfo] = React.useState<CantineData | null>(null);
  // default date is today
  const [selectedDate, setSelectedDate] = React.useState<string>('');

  const getCantineInfo = async () => {
    try {
      const cantineInfoResponse = (await signedFetchJson(
        `${getPlatform()?.url}/appregistry/0772128V/cantine/menu?date=${selectedDate}`,
      )) as CantineData;

      setCantineInfo(cantineInfoResponse);
    } catch (error) {
      console.error('Error getting cantine info:', error);
    }
  };

  React.useEffect(() => {
    if (selectedDate.length === 0) {
      return;
    }

    getCantineInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View>
        <DayPicker
          onDateChange={date => {
            setCantineInfo(null);
            setSelectedDate(date.format('YYYY-MM-DD'));
          }}
          style={styles.dayPicker}
        />
      </View>
      {cantineInfo && cantineInfo.menu.length > 0 ? (
        <MenuCard menuItems={cantineInfo.menu} />
      ) : (
        <View style={styles.emptyContainer}>
          <BodyBoldText style={styles.emptyTitle}>{I18n.get('cantine-home-empty-title')}</BodyBoldText>
        </View>
      )}
    </ScrollView>
  );
}
