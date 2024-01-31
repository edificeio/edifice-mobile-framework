import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  content: {
    flexGrow: 1,
    backgroundColor: theme.ui.background.page,
  },
  contentStyle2: {
    backgroundColor: theme.ui.background.page,
    flex: 1,
  },
  detailsMain: {
    backgroundColor: theme.ui.background.card,
  },
  detailsPost: {
    marginTop: UI_SIZES.spacing.medium,
  },
  detailsNeedValidation: {
    color: theme.palette.status.warning.regular,
  },
  detailsTitleBlog: {
    color: theme.ui.text.light,
  },
  detailsTitlePost: {
    marginBottom: UI_SIZES.spacing.medium,
  },
  detailsNbComments: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: UI_SIZES.spacing.minor,
    padding: UI_SIZES.spacing.small,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: theme.ui.border.input,
    borderBottomColor: theme.ui.border.input,
  },
  detailsIconComments: {
    marginRight: UI_SIZES.spacing.minor,
  },
  detailsTextNbComments: {
    color: theme.ui.text.light,
  },
  editorStyle: {
    color: theme.palette.grey.black,
    primaryColor: theme.palette.primary.regular,
  },
  footerNoComment: {
    height: 0,
  },
  footerWaitingValidation: {
    color: theme.palette.secondary.regular,
  },
});
