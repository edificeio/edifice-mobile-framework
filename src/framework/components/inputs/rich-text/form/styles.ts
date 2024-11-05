import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

const styles = StyleSheet.create({
  addButton: {
    marginTop: UI_SIZES.spacing.big,
  },
  addFilesResults: {
    padding: UI_SIZES.spacing.medium,
    paddingBottom: UI_SIZES.screen.bottomInset,
  },
  addFilesResultsFile: { flex: 1 },
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
  choosePicsMenuElement: {
    columnGap: UI_SIZES.spacing.small,
    flexDirection: 'row',
    paddingVertical: UI_SIZES.spacing.minor,
  },
  choosePicsMenuTitle: {
    alignSelf: 'flex-start',
    marginBottom: UI_SIZES.spacing.big,
  },
  container: {
    flex: 1,
    marginBottom: UI_SIZES.screen.bottomInset,
  },
  page: {
    backgroundColor: theme.palette.grey.white,
  },
  richEditor: {
    minHeight: '90%',
  },
  scrollView: {
    flexGrow: 1,
    padding: UI_SIZES.spacing.medium,
    paddingBottom: 0,
  },
  toolbar: { marginTop: -UI_SIZES.elements.editor.toolbarHeight },
});

export default styles;
