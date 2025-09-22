import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

export default StyleSheet.create({
  emptyScreen: {
    backgroundColor: undefined,
  },
  endSpacer: {
    opacity: 0,
    pointerEvents: 'none',
  },
  item: {
    alignItems: 'stretch',
    borderColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.mediumPlus,
    borderWidth: UI_SIZES.border.thin,
    flex: 1,
    flexDirection: 'row',
    gap: UI_SIZES.spacing.minor,
    margin: UI_SIZES.spacing.big / 2,
    padding: UI_SIZES.spacing.minor,
  },
  list: {
    paddingBottom: UI_SIZES.spacing.big / 2,
  },
  title: {
    marginHorizontal: UI_SIZES.spacing.big,
    marginTop: UI_SIZES.spacing.medium,
  },
  titlePlaceholder: {
    height: TextSizeStyle.Medium.lineHeight,
    marginHorizontal: UI_SIZES.spacing.big,
    marginTop: UI_SIZES.spacing.medium,
  },
});
