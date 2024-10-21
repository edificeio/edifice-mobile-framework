import * as React from 'react';
import { ColorValue, StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.ui.background.card,
    borderRadius: UI_SIZES.radius.card,
    marginVertical: UI_SIZES.spacing.tiny,
    padding: UI_SIZES.spacing.minor,
  },
  containerShadow: {
    elevation: 1,
    shadowColor: theme.ui.shadowColor,
    shadowOffset: { height: 1, width: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
  },
});

type ItemProps = {
  children?: React.ReactNode;
  color?: ColorValue;
  disabled?: boolean;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
  onPress?: () => any;
};

enum SidedComponentDirection {
  Left,
  Right,
  Top,
  Bottom,
}

type SidedItemProps = ItemProps & { shadow?: boolean; side: SidedComponentDirection };

export const Item: React.FunctionComponent<ItemProps> = ({ children, color, disabled, onPress, selected, style }) => {
  const selectedStyle = color && selected ? { borderColor: color, borderWidth: 2 } : {};

  return (
    <TouchableOpacity disabled={onPress == null || disabled} style={[styles.container, selectedStyle, style]} onPress={onPress}>
      {children}
    </TouchableOpacity>
  );
};

const ShadowedItem: React.FunctionComponent<ItemProps> = ({ style, ...rest }) => (
  <Item style={[styles.containerShadow, style]} {...rest} />
);

const SidedItem: React.FunctionComponent<SidedItemProps> = props => {
  const { shadow, style, ...rest } = props;
  const ItemComponent = shadow ? ShadowedItem : Item;

  const getStyleFromSide: (side: SidedComponentDirection, color?: ColorValue) => ViewStyle = (side, color) => {
    switch (side) {
      case SidedComponentDirection.Left:
        return { borderLeftColor: color, borderLeftWidth: 6 };
      case SidedComponentDirection.Right:
        return { borderRightColor: color, borderRightWidth: 6 };
      case SidedComponentDirection.Top:
        return { borderTopColor: color, borderTopWidth: 6 };
      case SidedComponentDirection.Bottom:
        return { borderBottomColor: color, borderBottomWidth: 12 };
    }
  };

  return <ItemComponent style={[getStyleFromSide(props.side, props.color), style]} {...rest} />;
};

export const LeftColoredItem: React.FunctionComponent<Omit<SidedItemProps, 'side'>> = props => (
  <SidedItem side={SidedComponentDirection.Left} {...props} />
);

export const BottomColoredItem: React.FunctionComponent<Omit<SidedItemProps, 'side'>> = props => (
  <SidedItem side={SidedComponentDirection.Bottom} {...props} />
);
