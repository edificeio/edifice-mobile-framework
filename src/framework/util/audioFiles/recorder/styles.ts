import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

const styles = StyleSheet.create({
  buttonDelete: {
    padding: UI_SIZES.spacing.minor,
  },
  buttonPause: {
    alignItems: 'center',
    backgroundColor: theme.palette.primary.regular,
    borderRadius: UI_SIZES.radius.extraLarge,
    height: UI_SIZES.elements.icon.xlarge,
    justifyContent: 'center',
    padding: UI_SIZES.spacing.minor,
    width: UI_SIZES.elements.icon.xlarge,
  },
  buttonPlayStop: {
    alignItems: 'center',
    backgroundColor: theme.palette.complementary.red.regular,
    borderRadius: UI_SIZES.radius.extraLarge,
    height: UI_SIZES.elements.icon.default * 2,
    justifyContent: 'center',
    padding: UI_SIZES.spacing.minor,
    width: UI_SIZES.elements.icon.default * 2,
  },
  buttonsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: getScaleWidth(327),
  },
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingBottom: UI_SIZES.spacing.large,
    paddingHorizontal: UI_SIZES.spacing.big,
    paddingTop: UI_SIZES.spacing.big * 2,
  },
  placeholderText: {
    color: theme.palette.grey.graphite,
    marginBottom: UI_SIZES.spacing.medium,
  },
});

export default styles;
