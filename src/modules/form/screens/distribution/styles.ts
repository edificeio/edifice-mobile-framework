import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  saveActionContainer: {
    height: '100%',
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: UI_SIZES.spacing.minor,
  },
  summaryText: {
    alignSelf: 'center',
    color: theme.palette.primary.regular,
    marginBottom: UI_SIZES.spacing.small,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  positionActionContainer: {
    width: 100,
  },
  listFooterContainer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  listContainer: {
    flexGrow: 1,
    paddingVertical: UI_SIZES.spacing.medium,
  },
});
