import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES, UI_VALUES } from '~/framework/components/constants';

const styles = StyleSheet.create({
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: UI_SIZES.spacing.medium,
  },
  card: {
    backgroundColor: theme.palette.grey.white,
    borderRadius: UI_SIZES.radius.mediumPlus,
    overflow: 'hidden',
    paddingHorizontal: UI_SIZES.spacing.big,
    paddingTop: UI_SIZES.spacing.big,
    width: '80%',
  },

  container: {
    alignItems: 'center',
    backgroundColor: `rgba(0, 0, 0, ${UI_VALUES.opacity.modal})`,
    flex: 1,
    justifyContent: 'center',
  },
  progressBarFill: {
    backgroundColor: theme.palette.primary.regular,
    borderRadius: UI_SIZES.radius.small,
    height: UI_SIZES.spacing.tiny,
  },
  progressBarTrack: {
    backgroundColor: theme.palette.grey.pearl,
    borderRadius: UI_SIZES.radius.small,
    height: UI_SIZES.spacing.tiny,
    marginTop: UI_SIZES.spacing.small,
    overflow: 'hidden',
    width: '100%',
  },
  separator: {
    backgroundColor: theme.palette.grey.pearl,
    height: 1,
    marginTop: UI_SIZES.spacing.big,
  },
  title: {
    textAlign: 'center',
  },
});

export default styles;
