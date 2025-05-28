import { StyleSheet } from 'react-native';

import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  addFilesResults: {
    padding: UI_SIZES.spacing.medium,
    paddingBottom: UI_SIZES.screen.bottomInset,
  },
  addFilesResultsFile: {
    flex: 1,
    justifyContent: 'center',
  },
  addFilesResultsItem: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: UI_SIZES.spacing.minor,
  },
  addFilesResultsTitle: {
    marginBottom: UI_SIZES.spacing.minor,
    textAlign: 'center',
  },
  addFilesResultsType: {
    alignItems: 'center',
    aspectRatio: 1,
    borderRadius: UI_SIZES.radius.card,
    justifyContent: 'center',
    marginRight: UI_SIZES.spacing.minor,
    width: getScaleWidth(36),
  },

  h22: {
    height: 22,
    marginBottom: 0,
  },
  //PLACEHOLDER
  placeholder: { padding: UI_SIZES.spacing.minor },
  placeholderMedia: {
    borderRadius: UI_SIZES.radius.card,
  },
  placeholderRow: {
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.minor,
    flexDirection: 'row',
    padding: UI_SIZES.spacing.minor,
  },
});
