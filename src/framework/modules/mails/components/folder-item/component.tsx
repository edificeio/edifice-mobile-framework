import * as React from 'react';
import { TouchableOpacity, View, ViewStyle } from 'react-native';

import styles from './styles';
import { MailsFolderItemProps } from './types';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { SmallBoldText, SmallText } from '~/framework/components/text';

export const MailsFolderItem = (props: MailsFolderItemProps) => {
  const TextComponent = props.selected ? SmallBoldText : SmallText;

  const onPress = () => {
    props.onPress();
  };

  const suppStyles = (): ViewStyle => {
    if (props.depth && props.depth > 1) return { marginLeft: (props.depth - 1) * UI_SIZES.spacing.medium };
    return {};
  };

  const renderUnread = React.useCallback(() => {
    if (!props.nbUnread) return;
    return (
      <View style={styles.nbUnread}>
        <SmallBoldText style={styles.nbUnreadText}>{props.nbUnread}</SmallBoldText>
      </View>
    );
  }, [props.nbUnread]);

  return (
    <TouchableOpacity
      style={[styles.container, suppStyles(), props.selected ? styles.isSelected : props.disabled ? styles.disabled : {}]}
      disabled={props.disabled}
      onPress={onPress}>
      <Svg
        name={props.icon}
        fill={theme.palette.grey.black}
        width={UI_SIZES.elements.icon.default}
        height={UI_SIZES.elements.icon.default}
      />
      <TextComponent style={styles.text}>{props.name}</TextComponent>
      {renderUnread()}
    </TouchableOpacity>
  );
};
