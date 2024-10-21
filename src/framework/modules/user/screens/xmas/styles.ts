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
    justifyContent: 'space-between',
    marginTop: UI_SIZES.spacing.medium,
  },
  wishTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  xmasTree: {
    bottom: UI_SIZES.spacing.minor,
    position: 'absolute',
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
