import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { BodyBoldText } from '~/framework/components/text';
import styles from './styles';
import { HeaderBottomSheetModalProps } from './types';

export const HeaderBottomSheetModal = (props: HeaderBottomSheetModalProps) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.icon} disabled={props.iconLeftDisabled} onPress={props.onPressLeft ?? (() => {})}>
        {props.iconLeft ? (
          <Svg
            name={props.iconLeft}
            width={UI_SIZES.elements.icon.small}
            height={UI_SIZES.elements.icon.small}
            fill={theme.palette.primary[props.iconLeftDisabled ? 'light' : 'regular']}
          />
        ) : null}
      </TouchableOpacity>
      <BodyBoldText style={styles.title} numberOfLines={1}>
        {props.title}
      </BodyBoldText>
      <TouchableOpacity style={styles.icon} disabled={props.iconRightDisabled} onPress={props.onPressRight ?? (() => {})}>
        {props.iconRight ? (
          <Svg
            name={props.iconRight}
            width={UI_SIZES.elements.icon.small}
            height={UI_SIZES.elements.icon.small}
            fill={theme.palette.primary[props.iconRightDisabled ? 'light' : 'regular']}
          />
        ) : null}
      </TouchableOpacity>
    </View>
  );
};
