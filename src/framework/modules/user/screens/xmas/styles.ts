import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  textContainer: { paddingHorizontal: UI_SIZES.spacing.medium },
  toggleContainer: {
    flexDirection: 'row',
    paddingTop: UI_SIZES.spacing.large,
    paddingBottom: UI_SIZES.spacing.major,
    justifyContent: 'space-between',
  },
  xmasTreeContainer: {
    flex: 1,
  },
  xmasTree: {
    left: 120,
  },
});
