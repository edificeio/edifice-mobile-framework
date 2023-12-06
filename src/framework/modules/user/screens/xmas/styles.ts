import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  alertCard: {
    marginTop: UI_SIZES.spacing.medium,
  },
  page: {
    padding: UI_SIZES.spacing.medium,
    paddingBottom: 0,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginTop: UI_SIZES.spacing.medium,
    justifyContent: 'space-between',
  },
  wishTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  xmasTree: {
    position: 'absolute',
    bottom: UI_SIZES.spacing.minor,
    right: -UI_SIZES.spacing.small,
  },
  xmasTreeContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  xmasTreeSubcontainer: {
    flex: 1,
  },
});
