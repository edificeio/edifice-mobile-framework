import * as React from 'react';
import { LayoutChangeEvent, Modal, Pressable, useWindowDimensions, View, ViewStyle } from 'react-native';

import { PlatformPressable } from '@react-navigation/elements';

import theme from '~/app/theme';
import { Svg } from '~/framework/components/picture';
import { SmallText } from '~/framework/components/text';
import { useAppTheme } from '~/framework/modules/myapps/hooks';

import styles, { POPOVER_ANCHOR_GAP, POPOVER_ICON_SIZE, POPOVER_SCREEN_MARGIN } from './styles';
import { PopoverAction, PopoverAnchor, PopoverMenuProps, PopoverProps } from './types';

function Action({ action, onDone }: { action: PopoverAction; onDone: () => void }) {
  const press = React.useCallback(() => {
    onDone();
    action.action();
  }, [action, onDone]);

  const style = React.useMemo(() => (action.disabled ? [styles.action, styles.dimmed] : styles.action), [action.disabled]);

  // An app colours its own icon, as the platform declares it. Falls back to whatever the action
  // asked for, and to the colours of the file itself when it asked for nothing.
  const app = useAppTheme(action.appName ?? '');
  const fill = action.destructive ? theme.palette.status.failure.regular : action.appName ? app.colors.regular : action.color;

  return (
    <PlatformPressable style={style} onPress={press} disabled={action.disabled} testID={action.testID}>
      {action.icon ? <Svg name={action.icon} fill={fill} width={POPOVER_ICON_SIZE} height={POPOVER_ICON_SIZE} /> : null}
      <SmallText numberOfLines={1} style={action.destructive ? styles.actionTitleDestructive : styles.actionTitle}>
        {action.title}
      </SmallText>
    </PlatformPressable>
  );
}

function Menu({ actions, align, anchor, onClose }: PopoverMenuProps) {
  const window = useWindowDimensions();
  const [card, setCard] = React.useState<{ height: number; width: number }>();

  const measureCard = React.useCallback(
    ({ nativeEvent: { layout } }: LayoutChangeEvent) => setCard({ height: layout.height, width: layout.width }),
    [],
  );

  // Under the anchor, flipped above it when it would run past the bottom, and never past a side.
  // Hidden until measured, which takes the frame the card needs to lay itself out.
  const placement = React.useMemo<ViewStyle>(() => {
    if (!card) return { opacity: 0 };

    const below = anchor.y + anchor.height + POPOVER_ANCHOR_GAP;
    const fits = below + card.height <= window.height - POPOVER_SCREEN_MARGIN;
    const top = fits ? below : anchor.y - POPOVER_ANCHOR_GAP - card.height;
    const start = align === 'end' ? anchor.x + anchor.width - card.width : anchor.x;
    const furthest = window.width - POPOVER_SCREEN_MARGIN - card.width;

    return {
      left: Math.max(POPOVER_SCREEN_MARGIN, Math.min(start, furthest)),
      top: Math.max(POPOVER_SCREEN_MARGIN, top),
    };
  }, [align, anchor, card, window.height, window.width]);

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={[styles.card, placement]} onLayout={measureCard}>
          {actions.map(action => (
            <Action key={action.title} action={action} onDone={onClose} />
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

/**
 * A menu of ours, anchored under what opens it. Unlike the system menu it draws our own icons, and
 * closes on a touch anywhere outside since everything here belongs to our view tree.
 *
 *     <Popover actions={actions}>{opened => <MyButton active={opened} />}</Popover>
 *
 * Whatever is given as children only opens the menu: give it no press handler of its own.
 */
export function Popover({
  actions,
  align = 'end',
  anchor: knownAnchor,
  children,
  disabled,
  style,
  testID,
}: Readonly<PopoverProps>) {
  const anchorRef = React.useRef<View>(null);
  const [anchor, setAnchor] = React.useState<PopoverAnchor>();

  const open = React.useCallback(() => {
    if (knownAnchor) return setAnchor(knownAnchor);
    anchorRef.current?.measureInWindow((x, y, width, height) => setAnchor({ height, width, x, y }));
  }, [knownAnchor]);

  const close = React.useCallback(() => setAnchor(undefined), []);

  const anchorStyle = React.useMemo(() => (disabled ? [style, styles.dimmed] : style), [disabled, style]);
  const content = typeof children === 'function' ? children(!!anchor) : children;

  return (
    <View ref={anchorRef} style={anchorStyle} collapsable={false} testID={testID} pointerEvents={disabled ? 'none' : undefined}>
      <PlatformPressable onPress={open} disabled={disabled} pressColor="transparent">
        <View pointerEvents="none">{content}</View>
      </PlatformPressable>

      {anchor ? <Menu actions={actions} align={align} anchor={anchor} onClose={close} /> : null}
    </View>
  );
}
