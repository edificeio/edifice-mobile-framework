import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { pageGutterSize } from '~/framework/components/page';

export default StyleSheet.create({
  childPickerContentContainer: {
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingTop: UI_SIZES.spacing.medium,
  },
  colorsText: {
    marginRight: UI_SIZES.spacing.minor,
  },
  dropdown: {
    borderColor: theme.palette.primary.regular,
    borderWidth: 1,
  },
  dropdownMargin: {
    marginRight: UI_SIZES.spacing.small,
  },
  dropdownText: {
    color: theme.ui.text.regular,
  },
  dropdownsContainer: {
    flexDirection: 'row',
    zIndex: 100,
    marginVertical: UI_SIZES.spacing.small,
  },
  headerContainer: {
    margin: UI_SIZES.spacing.medium,
    zIndex: 5,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listContentContainer: {
    padding: pageGutterSize,
    paddingTop: 0,
    rowGap: pageGutterSize,
  },
  switchContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
});
