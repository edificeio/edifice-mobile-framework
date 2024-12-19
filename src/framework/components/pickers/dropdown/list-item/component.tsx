import * as React from 'react';
import { Pressable } from 'react-native';

import { RenderListItemPropsInterface, ValueType } from 'react-native-dropdown-picker';

import styles from './styles';

import theme from '~/app/theme';
import { BodyText } from '~/framework/components/text';

export const DropdownListItem = <T extends ValueType>(itemProps: RenderListItemPropsInterface<T>) => {
  const [isPressed, setPressed] = React.useState<boolean>(false);
  const backgroundColor = itemProps.isSelected ? theme.palette.primary.pale : isPressed ? theme.palette.grey.fog : undefined;

  const onPressIn = () => setPressed(true);

  const onPressOut = () => setPressed(false);

  //isChecked={itemProps.isSelected}
  return (
    <Pressable
      onPress={() => itemProps.onPress(itemProps.item)}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[styles.container, { backgroundColor }]}>
      {itemProps.IconComponent}
      <BodyText>{itemProps.label}</BodyText>
    </Pressable>
  );
};
