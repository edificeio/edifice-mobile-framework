import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { I18n } from '~/app/i18n';
import { modalScreenOptions } from '~/app/navigation/util';
import theme from '~/app/theme';
import { Checkbox } from '~/framework/components/checkbox';
import { UI_SIZES } from '~/framework/components/constants';
import NavBarAction from '~/framework/components/navigation/navbar-action';
import { Svg } from '~/framework/components/picture';
import { SmallBoldText, SmallText } from '~/framework/components/text';

import { useNotificationFiltersController } from './controller';
import styles from './styles';
import { NotificationFilterRowProps, NotificationFiltersScreenProps } from './types';

const SaveFiltersAction = ({ disabled, onPress }: Readonly<{ disabled: boolean; onPress?: () => void }>) => (
  <NavBarAction icon="ui-check" disabled={disabled} onPress={onPress} testID="notification-filters-save" />
);

const saveFiltersAction = (disabled: boolean, onPress?: () => void) => () => (
  <SaveFiltersAction disabled={disabled} onPress={onPress} />
);

export const NotificationFiltersScreenOptions = modalScreenOptions('fullScreenModal', () => ({
  headerRight: saveFiltersAction(true),
  title: I18n.get('timeline-filters-title'),
}));

const FilterRow = React.memo(({ checked, color, filter, icon, onPress }: Readonly<NotificationFilterRowProps>) => {
  const handlePress = React.useCallback(() => onPress(filter), [filter, onPress]);
  const iconColor = checked ? color : theme.palette.grey.black;
  return (
    <TouchableOpacity
      style={[styles.row, checked && styles.rowChecked]}
      onPress={handlePress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      testID={`notification-filters-row-${filter.type}`}>
      {icon ? (
        <Svg name={icon} fill={iconColor} width={UI_SIZES.elements.icon.default} height={UI_SIZES.elements.icon.default} />
      ) : null}
      <SmallText style={styles.rowLabel} numberOfLines={1}>
        {I18n.get(filter.i18n)}
      </SmallText>
      <Checkbox checked={checked} onPress={handlePress} />
    </TouchableOpacity>
  );
});

export function NotificationFiltersScreen({ navigation }: Readonly<NotificationFiltersScreenProps>) {
  const {
    areAllSelected,
    canSave,
    filterItems,
    isPartiallySelected,
    saveFilters,
    selectedCount,
    selectedFilters,
    toggleAllFilters,
    toggleFilter,
  } = useNotificationFiltersController(navigation);

  const { bottom } = useSafeAreaInsets();
  const listContentStyle = React.useMemo(() => ({ paddingBottom: UI_SIZES.spacing.big + bottom }), [bottom]);

  React.useLayoutEffect(() => {
    navigation.setOptions({ headerRight: saveFiltersAction(!canSave, saveFilters) });
  }, [canSave, navigation, saveFilters]);

  const renderItem = React.useCallback(
    ({ item }: { item: (typeof filterItems)[number] }) => (
      <FilterRow {...item} checked={!!selectedFilters[item.filter.type]} onPress={toggleFilter} />
    ),
    [selectedFilters, toggleFilter],
  );

  const keyExtractor = React.useCallback((item: (typeof filterItems)[number]) => item.filter.type, []);
  return (
    <View style={styles.page}>
      <View style={styles.selectAllRow}>
        <TouchableOpacity
          style={styles.selectAll}
          onPress={toggleAllFilters}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isPartiallySelected ? 'mixed' : areAllSelected }}
          testID="notification-filters-select-all">
          <SmallText>{I18n.get('timeline-filters-all')}</SmallText>
          <Checkbox checked={areAllSelected} partialyChecked={isPartiallySelected} onPress={toggleAllFilters} />
        </TouchableOpacity>
        <SmallBoldText>{I18n.get('timeline-filters-selected', { count: selectedCount, total: filterItems.length })}</SmallBoldText>
      </View>

      <FlashList
        data={filterItems}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={listContentStyle}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
