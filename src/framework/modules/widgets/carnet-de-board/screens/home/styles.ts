import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  button: {
    marginBottom: UI_SIZES.screen.bottomInset
      ? UI_SIZES.spacing.large + UI_SIZES.spacing.big - UI_SIZES.screen.bottomInset
      : UI_SIZES.spacing.large + UI_SIZES.spacing.medium,
    marginTop: UI_SIZES.spacing.large,
  },
  sections: {
    gap: UI_SIZES.spacing.medium,
    padding: UI_SIZES.spacing.medium,
  },
  structure: {
    marginHorizontal: UI_SIZES.spacing.medium,
    marginTop: UI_SIZES.spacing.medium,
  },
  users: {
    marginHorizontal: UI_SIZES.spacing.medium,
    marginTop: UI_SIZES.spacing.medium,
  },
});
