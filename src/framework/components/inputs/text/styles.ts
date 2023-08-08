import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES, getScaleFontSize } from '~/framework/components/constants';

const styles = StyleSheet.create({
  input: {
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.small,
    backgroundColor: theme.ui.background.card,
    borderWidth: 1,
    borderRadius: UI_SIZES.radius.input,
    color: theme.ui.text.regular,
    fontSize: getScaleFontSize(16),
  },
  inputDisabled: {
    backgroundColor: theme.palette.grey.pearl,
    color: theme.palette.grey.graphite,
  },
  callbackIndicator: {
    position: 'absolute',
    top: UI_SIZES.spacing.medium,
  },
  toggle: {
    position: 'absolute',
    right: 0,
    top: 0,
    paddingHorizontal: UI_SIZES.spacing.small,
    borderLeftWidth: 1,
    borderColor: theme.ui.border.input,
    justifyContent: 'center',
    height: '100%',
  },
  annotation: {
    marginTop: UI_SIZES.spacing.tiny,
    color: theme.palette.grey.graphite,
  },
  annotationError: {
    color: theme.palette.status.failure.regular,
  },
  annotationSuccess: {
    color: theme.palette.status.success.regular,
  },
});

export default styles;
