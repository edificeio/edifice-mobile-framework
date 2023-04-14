import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  child: { marginBottom: UI_SIZES.spacing.medium },
  relative: { marginBottom: UI_SIZES.spacing.medium },
  relativesContentContainer: { marginTop: UI_SIZES.spacing.large },
  relativesListFooter: { paddingBottom: UI_SIZES.screen.bottomInset },
  structureName: { marginTop: UI_SIZES.spacing.big, paddingHorizontal: UI_SIZES.spacing.medium },
});
