import { StyleSheet } from 'react-native';

import { UI_SIZES, getScaleWidth } from '~/framework/components/constants';

export default StyleSheet.create({
  addFilesResults: {
    padding: UI_SIZES.spacing.medium,
    paddingBottom: UI_SIZES.screen.bottomInset,
  },
  addFilesResultsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: UI_SIZES.spacing.minor,
  },
  addFilesResultsType: {
    width: getScaleWidth(36),
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: UI_SIZES.radius.card,
    marginRight: UI_SIZES.spacing.minor,
  },
  addFilesResultsFile: {
    flex: 1,
    justifyContent: 'center',
  },
  addFilesResultsTitle: {
    textAlign: 'center',
    marginBottom: UI_SIZES.spacing.minor,
  },
  //PLACEHOLDER
  placeholder: { padding: UI_SIZES.spacing.minor },
  placeholderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.minor,
    padding: UI_SIZES.spacing.minor,
  },
  placeholderMedia: {
    borderRadius: UI_SIZES.radius.card,
  },
  h22: {
    height: 22,
    marginBottom: 0,
  },
});
