import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES, getScaleWidth } from '~/framework/components/constants';

export default StyleSheet.create({
  page: {
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.big,
    backgroundColor: theme.palette.grey.white,
  },
  title: {
    textAlign: 'center',
    color: theme.palette.primary.regular,
    marginBottom: UI_SIZES.spacing.medium,
  },
  card: {
    padding: UI_SIZES.spacing.medium,
    backgroundColor: theme.palette.grey.fog,
    borderRadius: UI_SIZES.radius.mediumPlus,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.medium,
    marginVertical: UI_SIZES.spacing.minor,
  },
  cardReverse: {
    flexDirection: 'row-reverse',
  },
  text: {
    flex: 1,
    textAlign: 'center',
  },
  pic: {
    width: getScaleWidth(120),
    height: getScaleWidth(80),
  },
  button: {
    marginTop: UI_SIZES.spacing.large,
  },
});
