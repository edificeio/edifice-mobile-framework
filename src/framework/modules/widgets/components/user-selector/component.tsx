import * as React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { MenuAction } from '~/framework/components/menus/actions';
import PopupMenu from '~/framework/components/menus/popup';
import { Svg } from '~/framework/components/picture';
import { TextAvatar } from '~/framework/components/textAvatar';
import { WIDGET_USER_SELECTOR_AVATAR_SIZE, WIDGET_USER_SELECTOR_MAX_SHOWN } from '~/framework/modules/widgets/components/constants';
import { useTabbedPanel } from '~/framework/modules/widgets/components/panel';

import styles from './styles';
import { WidgetUserSelectorItem, WidgetUserSelectorProps, WidgetUserSelectorTabProps } from './types';

const TAB_STYLE = [styles.item, styles.itemTab];

function Tab({ item, onSelect, ref, ringColor, selectable, selected }: Readonly<WidgetUserSelectorTabProps>) {
  const select = React.useCallback(() => onSelect(item.id), [item.id, onSelect]);
  const ringStyle = React.useMemo(() => StyleSheet.flatten([styles.itemAvatarSelected, { borderColor: ringColor }]), [ringColor]);

  return (
    <TouchableOpacity
      ref={ref}
      style={selectable ? TAB_STYLE : styles.item}
      onPress={select}
      disabled={!selectable}
      accessibilityRole="tab"
      accessibilityState={{ disabled: !selectable, selected }}>
      <TextAvatar
        text={selected ? item.name : `${item.name.charAt(0)}.`}
        userId={item.userId}
        size={WIDGET_USER_SELECTOR_AVATAR_SIZE}
        isHorizontal
        textStyle={styles.itemText}
        customAvatarStyle={selected ? ringStyle : undefined}
      />
    </TouchableOpacity>
  );
}

function usePickOrder(items: WidgetUserSelectorItem[], selectedId: string | undefined, maxShown: number) {
  const [order, setOrder] = React.useState<string[]>([]);

  React.useEffect(() => {
    setOrder(previous => {
      const ids = items.map(item => item.id);
      const kept = previous.filter(id => ids.includes(id));
      return [...kept, ...ids.filter(id => !kept.includes(id))];
    });
  }, [items]);

  const ordered = React.useMemo(
    () =>
      order.reduce<WidgetUserSelectorItem[]>((acc, id) => {
        const item = items.find(one => one.id === id);
        if (item) acc.push(item);
        return acc;
      }, []),
    [items, order],
  );

  // Coming from the menu, a user takes the first seat: the one before it becomes second, and the
  // last one shown falls back into the menu.
  const moveFirst = React.useCallback((id: string) => setOrder(previous => [id, ...previous.filter(one => one !== id)]), []);

  // The order does not outlive the row, so a user picked from the menu falls back into it on the
  // next mount, selected but out of sight. The selected one takes the first seat back.
  React.useEffect(() => {
    if (selectedId && ordered.findIndex(item => item.id === selectedId) >= maxShown) moveFirst(selectedId);
  }, [maxShown, moveFirst, ordered, selectedId]);

  return { moveFirst, ordered };
}

export function WidgetUserSelector({
  action,
  items,
  maxShown = WIDGET_USER_SELECTOR_MAX_SHOWN,
  onSelect,
  ringColor,
  selectedId,
}: Readonly<WidgetUserSelectorProps>) {
  const { moveFirst, ordered } = usePickOrder(items, selectedId, maxShown);
  const shown = React.useMemo(() => ordered.slice(0, maxShown), [maxShown, ordered]);
  const hidden = React.useMemo(() => ordered.slice(maxShown), [maxShown, ordered]);
  const panel = useTabbedPanel();

  const asTabs = shown.length > 1;

  const selectFromMenu = React.useCallback(
    (id: string) => {
      moveFirst(id);
      onSelect(id);
    },
    [moveFirst, onSelect],
  );

  const menuActions = React.useMemo<MenuAction[]>(
    () => hidden.map(item => ({ action: () => selectFromMenu(item.id), title: item.name })),
    [hidden, selectFromMenu],
  );

  const rowRef = React.useRef<View>(null);
  const selectedTabRef = React.useRef<View>(null);

  // both boxes are read in the same frame: what the panel wants is
  // where the tab sits in the row, so the row's own origin is taken back out.
  React.useLayoutEffect(() => {
    if (!asTabs || !selectedId) {
      panel?.setTab(undefined);
      return;
    }

    const row = rowRef.current?.getBoundingClientRect();
    const tab = selectedTabRef.current?.getBoundingClientRect();
    if (!row || !tab) return;

    panel?.setTab({ height: tab.height, width: tab.width, x: tab.x - row.x });
  }, [asTabs, panel, selectedId, shown]);

  return (
    <View ref={rowRef} style={styles.row} accessibilityRole="tablist">
      {shown.map(item => (
        <Tab
          key={item.id}
          ref={item.id === selectedId ? selectedTabRef : undefined}
          item={item}
          selected={item.id === selectedId}
          selectable={asTabs}
          onSelect={onSelect}
          ringColor={ringColor}
        />
      ))}
      {action && hidden.length ? (
        <View style={styles.action}>
          <PopupMenu actions={menuActions} testID={action.testID}>
            <View style={styles.actionCircle}>
              <Svg
                name={action.icon}
                fill={theme.palette.secondary.dark}
                width={UI_SIZES.elements.icon.small}
                height={UI_SIZES.elements.icon.small}
              />
            </View>
          </PopupMenu>
        </View>
      ) : null}
    </View>
  );
}
