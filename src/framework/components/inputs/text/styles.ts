import { Platform, StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

const IOS_TEXTINPUT_LINE_HEIGHT = 1.23; // This is a magic value because IOS overrides line-height in TextInputs with a unknown value. This is an estimation of that value.
const ANDROID_TEXTINPUT_LINE_HEIGHT = TextSizeStyle.Medium.lineHeight / TextSizeStyle.Medium.fontSize; // On Android, line-height is different of regular texts to match iOS design.
export const TEXTINPUT_LINE_HEIGHT = Platform.select({
  android: ANDROID_TEXTINPUT_LINE_HEIGHT,
  default: 1,
  ios: IOS_TEXTINPUT_LINE_HEIGHT,
});

const styles = StyleSheet.create({
  annotation: {
    color: theme.palette.grey.graphite,
    marginTop: UI_SIZES.spacing.tiny,
  },
  annotationError: {
    color: theme.palette.status.failure.regular,
  },
  annotationSuccess: {
    color: theme.palette.status.success.regular,
  },
  callbackIndicator: {
    position: 'absolute',
  },
  input: {
    ...TextSizeStyle.Medium,
    backgroundColor: theme.ui.background.card,
    borderRadius: UI_SIZES.radius.input,
    borderWidth: UI_SIZES.border.thin,
    color: theme.ui.text.regular,
    lineHeight: Platform.select({ android: TextSizeStyle.Small.lineHeight, default: undefined }),
    // Computing of vertical alignment of the content.
    // TextInput sizing logic depends on the OS. On Android, we need to compensate the line-height included to the padding-bottom.
    paddingBottom:
      Platform.OS === 'android'
        ? UI_SIZES.spacing.medium - (TextSizeStyle.Small.lineHeight - TextSizeStyle.Medium.fontSize)
        : UI_SIZES.spacing.medium,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingTop: UI_SIZES.spacing.medium,
    textAlignVertical: 'top',
  },
  inputDisabled: {
    backgroundColor: theme.palette.grey.pearl,
    color: theme.palette.grey.graphite,
  },
  inputWithMaxLength: {
    // padding huge + minor to prevent text and indicator from overlapping
    paddingRight: UI_SIZES.spacing.medium + UI_SIZES.spacing.huge + UI_SIZES.spacing.minor,
    position: 'relative',
  },
  maxLengthText: {
    alignItems: 'center',
    bottom: Platform.OS === 'android' ? UI_SIZES.spacing.small + UI_SIZES.spacing._LEGACY_tiny : UI_SIZES.spacing.medium,
    color: theme.palette.grey.graphite,
    justifyContent: 'center',
    pointerEvents: 'none',
    position: 'absolute',
    right: UI_SIZES.spacing.medium,
    textAlign: 'right',
  },
  toggle: {
    borderColor: theme.ui.border.input,
    borderLeftWidth: 1,
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: UI_SIZES.spacing.small,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  viewInput: {
    justifyContent: 'center',
  },
});

export default styles;
