import { Platform, StyleSheet } from 'react-native';

import { NBK_COLORS } from './constants';

import { getScaleFontSize } from '~/framework/components/constants';

const textStyle = StyleSheet.create({
  bodyRoboto: {
    color: NBK_COLORS.white,
    fontFamily: Platform.select({ android: 'NabookRoboto', ios: 'Roboto' }),
    fontSize: getScaleFontSize(18),
    lineHeight: getScaleFontSize(22),
    textAlign: 'center',
  },
  btn: {
    color: NBK_COLORS.white,
    fontFamily: Platform.select({ android: 'NabookRoboto', ios: 'Roboto' }),
    fontSize: getScaleFontSize(20),
    textAlign: 'center',
  },
  codeClasse: {
    color: NBK_COLORS.premiumColor,
    fontFamily: Platform.select({ android: 'NabookPoppinsSemiBold', ios: 'Poppins-SemiBold' }),
    fontSize: getScaleFontSize(28),
    textAlign: 'center',
  },
  info: {
    color: NBK_COLORS.white,
    fontFamily: Platform.select({ android: 'NabookPoppinsItalic', ios: 'Poppins-Italic' }),
    fontSize: getScaleFontSize(14),
    textAlign: 'center',
  },
  title: {
    color: NBK_COLORS.white,
    fontFamily: Platform.select({ android: 'NabookPoppinsBoldItalic', ios: 'Poppins-BoldItalic' }),
    fontSize: getScaleFontSize(28),
    textAlign: 'center',
  },
});
export default textStyle;
