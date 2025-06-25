import * as React from 'react';
import { ActivityIndicator, GestureResponderEvent, StyleSheet, TouchableOpacity, View } from 'react-native';

import { isTablet } from 'react-native-device-info';

import { getScaleWidth } from '~/framework/components/constants';
import { SmallInverseText } from '~/framework/components/text';
import { NBK_COLORS } from '~/framework/modules/nabook/utils/constants';

interface BtnNBKProps {
  txt: string;
  isLoading?: boolean;
  clicked?: (e: GestureResponderEvent) => void;
}

const styles = StyleSheet.create({
  containerTxt: {
    alignItems: 'center',
    borderRadius: isTablet() ? 10 : 8,
    justifyContent: 'center',
  },
  shadowView: {
    borderRadius: isTablet() ? 10 : 8,
    paddingBottom: isTablet() ? 6 : 4,
    width: '100%',
  },
});

const BtnNBK: React.FunctionComponent<BtnNBKProps> = (props: BtnNBKProps) => {
  const { clicked, isLoading = false, txt } = props;

  return (
    <TouchableOpacity
      style={[
        styles.shadowView,
        {
          backgroundColor: NBK_COLORS.shadowOrangeOpacity50,
        },
      ]}
      onPress={e => {
        if (clicked) clicked(e);
      }}
      disabled={isLoading}>
      <View
        style={[
          styles.containerTxt,
          {
            backgroundColor: NBK_COLORS.orange,
            padding: getScaleWidth(15),
          },
        ]}>
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size={isTablet() ? 'large' : 'small'} />
        ) : (
          <View>
            <SmallInverseText>{txt}</SmallInverseText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default BtnNBK;
