import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES, getScaleWidth } from '~/framework/components/constants';

const styles = StyleSheet.create({
  addButton: {
    marginTop: UI_SIZES.spacing.big,
  },
  addFilesResultsFile: { flex: 1 },
  addFilesResultsItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addFilesResultsType: {
    width: getScaleWidth(36),
    aspectRatio: 1,
    backgroundColor: theme.palette.complementary.green.pale,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: UI_SIZES.radius.card,
    marginRight: UI_SIZES.spacing.minor,
  },
  choosePicsMenuTitle: {
    marginBottom: UI_SIZES.spacing.big,
    alignSelf: 'flex-start',
  },
  choosePicsMenuElement: {
    flexDirection: 'row',
    columnGap: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.minor,
  },
  choosePicsMenuSeparator: {
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.grey.cloudy,
    marginVertical: UI_SIZES.spacing.small,
    marginHorizontal: UI_SIZES.spacing.minor,
  },
  container: {
    marginBottom: UI_SIZES.screen.bottomInset,
    flex: 1,
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
