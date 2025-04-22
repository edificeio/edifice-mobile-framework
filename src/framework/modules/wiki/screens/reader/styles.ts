import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

export default StyleSheet.create({
  bottomNavigation: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: UI_SIZES.spacing.tiny,
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingBottom: UI_SIZES.spacing.medium,
    paddingHorizontal: UI_SIZES.spacing.small,
  },
  bottomNavigationRight: {
    marginLeft: 'auto',
  },
  bottomSheetNewPageButton: {
    alignSelf: 'baseline',
    marginLeft: UI_SIZES.spacing.minor,
  },
  content: {
    margin: UI_SIZES.spacing.big,
  },
  contentLoader: { gap: UI_SIZES.spacing.minor },
  header: {
    alignItems: 'stretch',
    backgroundColor: theme.palette.primary.pale,
    borderBottomColor: theme.palette.primary.light,
    borderBottomWidth: UI_SIZES.border.thin,
    borderTopColor: theme.palette.primary.light,
    borderTopWidth: UI_SIZES.border.thin,
    gap: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.big,
    paddingVertical: UI_SIZES.spacing.medium,
  },
  headerAuthorInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: UI_SIZES.spacing.small,
  },
  headerAuthorInfoText: {
    flex: 1,
  },
  headerAuthorInfoTextPlaceholder: { gap: UI_SIZES.spacing.tiny },
  headerPlaceholderAvatar: { margin: -UI_SIZES.border.small },
  headerPlaceholderInfo: { marginVertical: UI_SIZES.spacing.tiny },
  headerPlaceholderTitle: { marginVertical: -UI_SIZES.border.thin },
  loader: {
    backgroundColor: theme.ui.background.card,
    flex: 1,
  },
  page: {
    backgroundColor: theme.ui.background.card,
  },
  scrollContent: {
    flexGrow: 1,
  },
  selectButtonWrapper: {
    alignSelf: 'stretch',
    backgroundColor: theme.palette.grey.fog,
    borderRadius: UI_SIZES.radius.card,
    gap: UI_SIZES.spacing.minor,
    height: TextSizeStyle.Medium.lineHeight + 2 * UI_SIZES.spacing.minor,
    marginHorizontal: UI_SIZES.spacing.big,
    marginVertical: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.minor,
  },
  separatorSpacing: {
    paddingHorizontal: UI_SIZES.spacing.tiny,
  },
  topNavigation: {
    alignItems: 'stretch',
    paddingHorizontal: UI_SIZES.spacing.big,
  },
  webViewPlaceholder: {
    height: '100%',
    position: 'absolute',
    width: '100%',
  },
});
