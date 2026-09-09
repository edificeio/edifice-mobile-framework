import * as React from 'react';
import { LayoutChangeEvent, StyleSheet, TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { MenuAction } from '~/framework/components/menus/actions';
import PopupMenu from '~/framework/components/menus/popup';
import { Svg } from '~/framework/components/picture';
import { TextAvatar } from '~/framework/components/textAvatar';
import {
  WIDGET_ACTION_ICON_SIZE,
  WIDGET_USER_SELECTOR_AVATAR_SIZE,
  WIDGET_USER_SELECTOR_MAX_SHOWN,
} from '~/framework/modules/widgets/components/constants';
import { TabLayout, useTabbedPanel } from '~/framework/modules/widgets/components/tabbed-panel';

import styles from './styles';
import { WidgetUserSelectorItem, WidgetUserSelectorProps, WidgetUserSelectorTabProps } from './types';

function Tab({ item, onMeasure, onSelect, ringColor, selected }: Readonly<WidgetUserSelectorTabProps>) {
  const select = React.useCallback(() => onSelect(item.id), [item.id, onSelect]);
  const ringStyle = React.useMemo(() => StyleSheet.flatten([styles.itemAvatarSelected, { borderColor: ringColor }]), [ringColor]);

  const measure = React.useCallback(
    ({ nativeEvent: { layout } }: LayoutChangeEvent) =>
      onMeasure(item.id, { height: layout.height, width: layout.width, x: layout.x }),
    [item.id, onMeasure],
  );

  return (
    <TouchableOpacity
      style={styles.item}
      onPress={select}
      onLayout={measure}
      accessibilityRole="tab"
      accessibilityState={{ selected }}>
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

  // All of them are kept, though the panel only ever wants the selected one: a tab reports itself
  // once and never again, its box being the same whether it is picked or not.
  const tabLayouts = React.useRef<Record<string, TabLayout>>({});

  const measureTab = React.useCallback(
    (id: string, layout: TabLayout) => {
      tabLayouts.current[id] = layout;
      if (asTabs && id === selectedId) panel?.setTab(layout);
    },
    [asTabs, panel, selectedId],
  );

  React.useEffect(() => {
    panel?.setTab(asTabs && selectedId ? tabLayouts.current[selectedId] : undefined);
  }, [asTabs, panel, selectedId]);

  return (
    <View style={styles.row} accessibilityRole="tablist">
      {shown.map(item => (
        <Tab
          key={item.id}
          item={item}
          selected={item.id === selectedId}
          onSelect={onSelect}
          onMeasure={measureTab}
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
                width={WIDGET_ACTION_ICON_SIZE}
                height={WIDGET_ACTION_ICON_SIZE}
              />
            </View>
          </PopupMenu>
        </View>
      ) : null}
    </View>
  );
}
