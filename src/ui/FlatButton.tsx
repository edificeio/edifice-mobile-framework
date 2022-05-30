import styled from '@emotion/native';
import * as React from 'react';
import { ActivityIndicator, TextStyle, View, ViewStyle } from 'react-native';

import theme from '~/app/theme';
import styles from '~/styles';
import { CommonStyles } from '~/styles/common/styles';

import { Row, RowProperties } from './Grid';
import { Weight } from './Typography';
import { Icon } from './icons/Icon';

export interface ValidTextIconProps {
  disabled?: boolean;
  fontSize?: number;
  leftName?: string;
  onPress?: any;
  rightName?: string;
  style?: any;
  title?: string;
  whiteSpace?: string;
  keyboardShow?: boolean;
  loading?: boolean;
  customButtonStyle?: ViewStyle;
  customTextStyle?: TextStyle;
}

export interface State {
  marginTop: any;
}

const Disable = () => <View style={styles.Disable} />;

export const FlatButton = ({
  disabled = false,
  leftName = '',
  onPress,
  rightName = '',
  title = '',
  whiteSpace = ' ',
  loading = false,
  customButtonStyle,
  customTextStyle,
}: ValidTextIconProps) => {
  if (loading) {
    return <ActivityIndicator size="large" color={theme.palette.primary.regular} />;
  }

  return (
    <ValidStyle disabled={disabled}>
      <ButtonStyleComponent onPress={() => onPress()} disabled={disabled} style={customButtonStyle}>
        <TextStyleComponent disabled={disabled} style={customTextStyle}>
          {leftName.length > 0 && <Icon name={leftName} />}
          {whiteSpace}
          {title}
          {whiteSpace}
          {rightName.length > 0 && <Icon name={rightName} />}
        </TextStyleComponent>
      </ButtonStyleComponent>
      {disabled && <Disable />}
    </ValidStyle>
  );
};

const ValidStyle = (props: RowProperties) => (
  <Row alignItems="center" justifyContent="center" height={38} marginTop={0} {...props} />
);

const ButtonStyleComponent = styled.TouchableOpacity(
  {
    borderRadius: 38 * 0.5,
    paddingHorizontal: 36,
    paddingVertical: 9,
  },
  ({ disabled }) => ({
    backgroundColor: disabled ? 'transparent' : theme.palette.primary.regular,
    borderColor: disabled ? theme.palette.primary.regular : CommonStyles.lightGrey,
    borderWidth: disabled ? 1 : 0,
  }),
);

const TextStyleComponent = styled.Text<{ disabled: boolean }>(
  {
    fontFamily: CommonStyles.primaryFontFamily,
    fontSize: 14,
    fontWeight: Weight.SemiBold,
    textAlignVertical: 'center',
  },
  ({ disabled }) => ({
    color: disabled ? theme.palette.primary.regular : CommonStyles.inverseColor,
  }),
);
