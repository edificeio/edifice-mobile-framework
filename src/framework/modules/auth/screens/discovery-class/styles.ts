import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  button: {
    marginTop: UI_SIZES.spacing.large,
  },
  card: {
    alignItems: 'center',
    backgroundColor: theme.palette.grey.fog,
    borderRadius: UI_SIZES.radius.mediumPlus,
    columnGap: UI_SIZES.spacing.medium,
    display: 'flex',
    flexDirection: 'row',
    marginVertical: UI_SIZES.spacing.minor,
    padding: UI_SIZES.spacing.medium,
  },
  cardReverse: {
    flexDirection: 'row-reverse',
  },
  container: {
    backgroundColor: theme.palette.grey.white,
  },
  hint: {
    flex: 0,
    marginTop: UI_SIZES.spacing.large - UI_SIZES.spacing.minor,
    textAlign: 'center',
  },
  page: {
    backgroundColor: theme.palette.grey.white,
    flex: 1,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.big,
  },
  pic: {
    height: getScaleWidth(80),
    width: getScaleWidth(120),
  },
  text: {
    flex: 1,
    textAlign: 'center',
  },
  title: {
    color: theme.palette.primary.regular,
    marginBottom: UI_SIZES.spacing.medium,
    textAlign: 'center',
  },
});
