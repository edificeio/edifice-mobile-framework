import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  customFolders: {
    marginBottom: UI_SIZES.spacing.minor,
    rowGap: UI_SIZES.spacing.minor,
  },
  defaultFolders: {
    rowGap: UI_SIZES.spacing.minor,
  },
  newFolderButton: {
    alignSelf: 'baseline',
    marginLeft: UI_SIZES.spacing.minor,
  },
});
