import * as React from 'react';
import { LayoutChangeEvent, Modal, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { SmallBoldText } from '~/framework/components/text';
import { TextAvatar } from '~/framework/components/textAvatar';
import {
  WIDGET_ACTION_ICON_SIZE,
  WIDGET_USER_SELECTOR_AVATAR_SIZE,
  WIDGET_USER_SELECTOR_MAX_SHOWN,
} from '~/framework/modules/widgets/components/constants';
import { TabLayout, useTabbedPanel } from '~/framework/modules/widgets/components/tabbed-panel';

import styles from './styles';
import {
  AnchorLayout,
  WidgetUserSelectorItem,
  WidgetUserSelectorMenuItemProps,
  WidgetUserSelectorMenuProps,
  WidgetUserSelectorProps,
  WidgetUserSelectorTabProps,
} from './types';

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

function MenuItem({ item, onSelect }: Readonly<WidgetUserSelectorMenuItemProps>) {
  const select = React.useCallback(() => onSelect(item.id), [item.id, onSelect]);

  return (
    <TouchableOpacity style={styles.menuItem} onPress={select} accessibilityRole="menuitem">
      <SmallBoldText numberOfLines={1}>{item.name}</SmallBoldText>
    </TouchableOpacity>
  );
}

function Menu({ anchor, items, onClose, onSelect }: Readonly<WidgetUserSelectorMenuProps>) {
  const position = React.useMemo(
    () =>
      anchor
        ? {
            right: UI_SIZES.screen.width - (anchor.x + anchor.width),
            top: anchor.y + anchor.height + UI_SIZES.spacing.tiny,
          }
        : undefined,
    [anchor],
  );

  return (
    <Modal visible={!!anchor} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
        {position ? (
          <View style={[styles.menu, position]} accessibilityRole="menu">
            {items.map(item => (
              <MenuItem key={item.id} item={item} onSelect={onSelect} />
            ))}
          </View>
        ) : null}
      </Pressable>
    </Modal>
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

  const actionButton = React.useRef<View>(null);
  const [anchor, setAnchor] = React.useState<AnchorLayout>();

  const openMenu = React.useCallback(() => {
    actionButton.current?.measureInWindow((x, y, width, height) => setAnchor({ height, width, x, y }));
  }, []);

  const closeMenu = React.useCallback(() => setAnchor(undefined), []);

  const selectFromMenu = React.useCallback(
    (id: string) => {
      setAnchor(undefined);
      moveFirst(id);
      onSelect(id);
    },
    [moveFirst, onSelect],
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
        <>
          <Pressable ref={actionButton} style={styles.action} onPress={openMenu} testID={action.testID}>
            {({ pressed }) => (
              <View style={[styles.actionCircle, pressed && styles.actionCirclePressed]}>
                <Svg
                  name={action.icon}
                  fill={theme.palette.secondary.dark}
                  width={WIDGET_ACTION_ICON_SIZE}
                  height={WIDGET_ACTION_ICON_SIZE}
                />
              </View>
            )}
          </Pressable>
          <Menu anchor={anchor} items={hidden} onClose={closeMenu} onSelect={selectFromMenu} />
        </>
      ) : null}
    </View>
  );
}
