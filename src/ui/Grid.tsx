/* @flow */
import styled from '@emotion/native';
import * as React from 'react';
import { FlexAlignType, View } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';
import TouchableOpacity from '~/ui/CustomTouchableOpacity';

export interface ColProperties {
  alignItems?: FlexAlignType;
  backgroundColor?: any;
  borderBottomColor?: string;
  borderBottomWidth?: number;
  disabled?: boolean;
  children?: any;
  justifyContent?: any;
  marginHorizontal?: number;
  marginTop?: number;
  marginBottom?: number;
  padding?: number;
  paddingVertical?: number;
  pv?: number;
  onPress?: (any) => void;
  size?: number;
  style?: any;
  width?: number;
}

export interface NewProps {
  alignItems?: any;
  flex: number;
  flexDirection?: 'column' | 'row' | 'row-reverse' | 'column-reverse';
  flexWrap: 'wrap' | 'nowrap';
  paddingVertical?: number;
}

export const Col = (props: ColProperties) => {
  const { size = null, width = null, disabled = null, paddingVertical = null, pv = null } = props;
  const newProps: NewProps = {
    flex: size ? size : width ? 0 : 1,
    flexDirection: 'column',
    flexWrap: 'wrap',
    paddingVertical: pv ? UI_SIZES.spacing.tiny / 2 : paddingVertical ? paddingVertical : 0,
  };

  if (props.onPress) {
    return (
      <TouchableOpacity onPress={props.onPress} disabled={disabled}>
        <View {...props} {...newProps}>
          {props.children}
        </View>
      </TouchableOpacity>
    );
  } else {
    return <View {...props} {...newProps} />;
  }
};

export interface RowProperties {
  alignItems?: FlexAlignType;
  backgroundColor?: any;
  borderBottomColor?: string;
  borderBottomWidth?: number;
  children?: any;
  disabled?: boolean;
  height?: any;
  justifyContent?: any;
  marginLeft?: number;
  marginTop?: number;
  marginBottom?: number;
  paddingBottom?: number;
  paddingTop?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;
  onPress?: (any) => void;
  size?: number;
  style?: any;
  width?: any;
}

export const Line = styled.View({
  flexDirection: 'row',
  width: '100%',
});

// deprecated, too many props. Use Line and add new components for specific cases (touchable, grid, ...)
export const Row = (props: RowProperties) => {
  const { disabled = null, size = null, height = null } = props;
  const newProps: NewProps = {
    flex: size ? size : height ? 0 : 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  };

  if (props.onPress) {
    return (
      <TouchableOpacity onPress={props.onPress} disabled={disabled}>
        <View {...props} {...newProps}>
          {props.children}
        </View>
      </TouchableOpacity>
    );
  } else {
    return <View {...props} {...newProps} />;
  }
};
