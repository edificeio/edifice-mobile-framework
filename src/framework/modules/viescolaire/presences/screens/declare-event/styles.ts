import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  backdropContainer: {
    height: UI_SIZES.screen.height,
    left: 0,
    position: 'absolute',
    top: 0,
    width: UI_SIZES.screen.width,
  },
  container: {
    flexGrow: 1,
    padding: UI_SIZES.spacing.big,
    rowGap: UI_SIZES.spacing.big,
  },
  deleteActionContainer: {
    zIndex: -1,
  },
  fieldContainer: {
    rowGap: UI_SIZES.spacing.minor,
  },
  headingContainer: {
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.small,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headingNameContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 1,
  },
  headingNameText: {
    flexShrink: 1,
    marginLeft: UI_SIZES.spacing.small,
  },
  pageContainer: {
    backgroundColor: theme.palette.grey.white,
  },
  primaryActionContainer: {
    marginTop: UI_SIZES.spacing.big,
    zIndex: -1,
  },
  timePickerContainer: {
    alignSelf: 'center',
  },
});
