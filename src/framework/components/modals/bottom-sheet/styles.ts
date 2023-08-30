import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  contentContainer: {
    paddingHorizontal: UI_SIZES.spacing.big,
    paddingTop: UI_SIZES.spacing.large,
    paddingBottom: UI_SIZES.spacing.large + UI_SIZES.screen.bottomInset,
  },
});
