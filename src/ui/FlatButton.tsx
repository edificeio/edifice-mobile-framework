import styled from '@emotion/native';
import * as React from 'react';
import { ActivityIndicator, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Picture, PictureProps } from '~/framework/components/picture';

import { Row, RowProperties } from './Grid';
import { Weight } from './Typography';
import { Icon } from './icons/Icon';

export interface ValidTextIconProps {
  disabled?: boolean;
  fontSize?: number;
  leftName?: string;
  onPress?: any;
  rightName?: string | PictureProps;
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

const styles = StyleSheet.create({
  Disable: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
});

const Disable = () => <View style={styles.Disable} />;

export const FlatButton = ({
  disabled = false,
  leftName = '',
  onPress,
  rightName = undefined,
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
      <ButtonStyleComponent
        onPress={() => onPress()}
        disabled={disabled}
        style={[customButtonStyle, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}>
        <TextStyleComponent disabled={disabled} style={customTextStyle}>
          {leftName.length > 0 && <Icon name={leftName} />}
          {whiteSpace}
          {title}
          {whiteSpace}
          {rightName !== undefined && typeof rightName === 'string' ? <Icon name={rightName} /> : null}
        </TextStyleComponent>
        {rightName !== undefined && typeof rightName !== 'string' ? (
          <Picture
            fill={customTextStyle?.color ?? disabled ? theme.palette.primary.regular : theme.legacy.neutral.light}
            {...rightName}
            style={{ marginHorizontal: UI_SIZES.spacing._LEGACY_small }}
            width={22}
            height={22}
            size={22}
          />
        ) : null}
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
    paddingHorizontal: UI_SIZES.spacing.large,
    paddingVertical: 9, // ToDo remove magic number
  },
  ({ disabled }) => ({
    backgroundColor: disabled ? 'transparent' : theme.palette.primary.regular,
    borderColor: disabled ? theme.palette.primary.regular : theme.palette.grey.grey,
    borderWidth: disabled ? 1 : 0,
  }),
);

const TextStyleComponent = styled.Text<{ disabled: boolean }>(
  {
    fontFamily: 'OpenSans-Regular',
    fontSize: 14,
    fontWeight: Weight.SemiBold,
    textAlignVertical: 'center',
  },
  ({ disabled }) => ({
    color: disabled ? theme.palette.primary.regular : theme.legacy.neutral.light,
  }),
);
