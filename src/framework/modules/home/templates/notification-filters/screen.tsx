import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { I18n } from '~/app/i18n';
import { useConfirmRemove } from '~/app/navigation/use-confirm-remove';
import theme from '~/app/theme';
import { Checkbox } from '~/framework/components/checkbox';
import { UI_SIZES } from '~/framework/components/constants';
import NavBarAction from '~/framework/components/navigation/navbar-action';
import { Svg } from '~/framework/components/picture';
import { SmallBoldText, SmallText } from '~/framework/components/text';

import styles from './styles';
import { NotificationFilterItem, NotificationFilterRowProps, NotificationFiltersTemplateProps } from './types';

const SaveAction = ({ disabled, onPress }: Readonly<{ disabled: boolean; onPress?: () => void }>) => (
  <NavBarAction icon="ui-check" disabled={disabled} onPress={onPress} testID="notification-filters-save" />
);

export const saveFiltersAction = (disabled: boolean, onPress?: () => void) => () => (
  <SaveAction disabled={disabled} onPress={onPress} />
);

const ROW_CHECKED_STYLE = [styles.row, styles.rowChecked];

const FilterRow = React.memo(({ checked, color, icon, id, labelI18n, onPress }: Readonly<NotificationFilterRowProps>) => {
  const handlePress = React.useCallback(() => onPress(id), [id, onPress]);
  const iconColor = checked ? color : theme.palette.grey.black;

  return (
    <TouchableOpacity
      style={checked ? ROW_CHECKED_STYLE : styles.row}
      onPress={handlePress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      testID={`notification-filters-row-${id}`}>
      {icon ? (
        <Svg name={icon} fill={iconColor} width={UI_SIZES.elements.icon.default} height={UI_SIZES.elements.icon.default} />
      ) : null}
      <SmallText style={styles.rowLabel} numberOfLines={1}>
        {I18n.get(labelI18n)}
      </SmallText>
      <Checkbox checked={checked} onPress={handlePress} />
    </TouchableOpacity>
  );
});

const keyExtractor = (item: NotificationFilterItem) => item.id;

export function NotificationFiltersTemplate({
  items,
  labelsI18n,
  navigation,
  onSave,
  savedSelection,
}: Readonly<NotificationFiltersTemplateProps>) {
  const [selection, setSelection] = React.useState(savedSelection);

  const { bottom } = useSafeAreaInsets();
  const listContentStyle = React.useMemo(() => ({ paddingBottom: UI_SIZES.spacing.big + bottom }), [bottom]);

  const selectedCount = React.useMemo(() => items.filter(({ id }) => selection[id]).length, [items, selection]);
  const areAllSelected = selectedCount === items.length;
  const areNoneSelected = selectedCount === 0;
  const isPartiallySelected = !areAllSelected && !areNoneSelected;

  const hasUnsavedChanges = React.useMemo(
    () => items.some(({ id }) => !!savedSelection[id] !== !!selection[id]),
    [items, savedSelection, selection],
  );
  const canSave = hasUnsavedChanges && !areNoneSelected;

  const toggleAll = React.useCallback(() => {
    const selected = !areAllSelected;
    setSelection(Object.fromEntries(items.map(({ id }) => [id, selected])));
  }, [areAllSelected, items]);

  const toggleItem = React.useCallback((id: string) => {
    setSelection(previous => ({ ...previous, [id]: !previous[id] }));
  }, []);

  const handleSave = React.useCallback(() => onSave(selection), [onSave, selection]);

  useConfirmRemove(hasUnsavedChanges, {
    text: I18n.get(labelsI18n.leaveAlertText),
    title: I18n.get(labelsI18n.leaveAlertTitle),
  });

  React.useEffect(() => {
    navigation.setOptions({ headerRight: saveFiltersAction(!canSave, handleSave) });
  }, [canSave, navigation, handleSave]);

  const renderItem = React.useCallback<ListRenderItem<NotificationFilterItem>>(
    ({ item }) => <FilterRow {...item} checked={!!selection[item.id]} onPress={toggleItem} />,
    [selection, toggleItem],
  );

  return (
    <View style={styles.page}>
      <View style={styles.selectAllRow}>
        <TouchableOpacity
          style={styles.selectAll}
          onPress={toggleAll}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isPartiallySelected ? 'mixed' : areAllSelected }}
          testID="notification-filters-select-all">
          <SmallText>{I18n.get(labelsI18n.selectAll)}</SmallText>
          <Checkbox checked={areAllSelected} partialyChecked={isPartiallySelected} onPress={toggleAll} />
        </TouchableOpacity>
        <SmallBoldText>{I18n.get(labelsI18n.selectedCount, { count: selectedCount, total: items.length })}</SmallBoldText>
      </View>

      <FlashList
        data={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={listContentStyle}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
