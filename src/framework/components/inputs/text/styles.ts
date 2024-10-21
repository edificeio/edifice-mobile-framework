import { Platform, StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

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
    borderWidth: 1,
    color: theme.ui.text.regular,
    lineHeight: undefined,
    paddingBottom: Platform.OS === 'android' ? UI_SIZES.spacing.small : UI_SIZES.spacing.medium,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingTop: Platform.OS === 'android' ? UI_SIZES.spacing.small : UI_SIZES.spacing.medium,
  },
  inputDisabled: {
    backgroundColor: theme.palette.grey.pearl,
    color: theme.palette.grey.graphite,
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
