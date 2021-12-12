import style from 'glamorous-native';
import * as React from 'react';
import { Platform, ViewStyle, SafeAreaView, StyleProp } from 'react-native';
import { hasNotch } from 'react-native-device-info';
import { connect } from 'react-redux';

import { UI_SIZES } from '~/framework/components/constants';
import { CommonStyles } from '~/styles/common/styles';
import { Icon } from '~/ui';
import TouchableOpacity from '~/ui/CustomTouchableOpacity';

/**
 * DEPRECATED
 * Use the navigationOtions way as used in the user functional module, combined with ./NewHeader.tsx.
 */

const isIphoneX = () => false; // ToDo use React Navigation iPhoneX Compatibility here
export const iosStatusBarHeight = isIphoneX() ? 40 : 20;

const containerBar: ViewStyle = {
  alignItems: 'center',
  elevation: 5,
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'flex-start',
  paddingTop: Platform.OS === 'ios' ? iosStatusBarHeight : 0,
};

const HeaderStyle = style(SafeAreaView)({
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  backgroundColor: CommonStyles.mainColorTheme,
  paddingTop: Platform.OS === 'ios' ? iosStatusBarHeight : 0,
  height: Platform.select({ ios: hasNotch() ? 100 : 76, default: UI_SIZES.headerHeight }),
});

export const HeaderComponent = ({
  connectionTracker,
  children,
  color,
  customStyle,
  onLayout,
}: {
  connectionTracker: any;
  children: any;
  color?: string;
  customStyle?: StyleProp<ViewStyle>;
  onLayout?: () => void;
}) => (
  <HeaderStyle
    onLayout={() => onLayout && onLayout()}
    style={[
      {
        elevation: connectionTracker.visible ? 0 : 5,
        backgroundColor: color ? color : CommonStyles.mainColorTheme,
      },
      customStyle,
    ]}>
    {children}
  </HeaderStyle>
);

export const Header = connect((state: any) => ({
  connectionTracker: state.connectionTracker,
}))(HeaderComponent);

export const sensitiveStylePanel: ViewStyle = {
  alignItems: 'center',
  height: UI_SIZES.headerHeight,
  justifyContent: 'center',
  paddingLeft: 18,
  paddingRight: 18,
  width: 60,
};

const iconsDeltaSizes = {
  close: 16,
};

export const HeaderIcon = ({
  name,
  hidden,
  onPress,
  iconSize,
}: {
  name: string;
  hidden?: boolean;
  onPress?: () => void;
  iconSize?: number;
}) => (
  <TouchableOpacity style={sensitiveStylePanel} onPress={() => onPress && onPress()}>
    <Icon size={iconSize || iconsDeltaSizes[name] || 20} name={name} color={hidden ? 'transparent' : '#FFFFFF'} />
  </TouchableOpacity>
);

export const TouchableEndBarPanel = style(TouchableOpacity)({
  ...sensitiveStylePanel,
  alignSelf: 'flex-end',
});

export const CenterPanel = style(TouchableOpacity)({
  alignItems: 'center',
  flex: 1,
  height: UI_SIZES.headerHeight,
  justifyContent: 'center',
});

export const AppTitle = style.text({
  color: 'white',
  fontFamily: CommonStyles.primaryFontFamily,
  fontWeight: '400',
  fontSize: 16,
  flex: 1,
  textAlign: 'center',
  height: UI_SIZES.headerHeight,
  lineHeight: UI_SIZES.headerHeight,
});

export const HeaderAction = style.text(
  {
    color: 'white',
    fontFamily: CommonStyles.primaryFontFamily,
    fontWeight: '400',
    flex: 1,
    textAlign: 'right',
    paddingRight: 20,
    height: UI_SIZES.headerHeight,
    lineHeight: UI_SIZES.headerHeight,
  },
  ({ disabled }: { disabled?: boolean }) => ({
    opacity: disabled ? 0.7 : 1,
  }),
);

export const Title = style.text(
  {
    color: 'white',
    fontFamily: CommonStyles.primaryFontFamily,
    fontWeight: '400',
    textAlign: 'left',
    textAlignVertical: 'center',
  },
  ({ smallSize = false }) => ({
    fontSize: smallSize ? 12 : 16,
  }),
);

export const SubTitle = style.text({
  color: 'white',
  fontFamily: CommonStyles.primaryFontFamily,
  fontWeight: '400',
  fontSize: 12,
  opacity: 0.7,
});
