import { StyleSheet } from 'react-native';
import theme from '~/app/theme';

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
  newFolderHeader: {
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.small,
    flexDirection: 'row',
    marginBottom: UI_SIZES.spacing.big,
  },
  selectFolder: {
    marginTop: UI_SIZES.spacing.medium,
    padding: UI_SIZES.spacing.minor,
    borderWidth: UI_SIZES.border.thin,
    borderColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.input,
    rowGap: UI_SIZES.spacing.tiny,
  },
  selectFolderTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
