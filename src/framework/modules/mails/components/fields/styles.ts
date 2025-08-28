import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

export default StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    borderBottomWidth: UI_SIZES.border.thin,
    borderColor: theme.palette.primary.light,
    columnGap: UI_SIZES.spacing.minor,
    flexDirection: 'row',
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.small,
  },
  containerEmpty: {
    alignItems: 'center',
  },
  containerInput: {
    columnGap: UI_SIZES.spacing.tiny,
    flex: 1,
    flexDirection: 'row',
  },
  containerIsEditing: {
    alignItems: 'flex-end',
  },
  iconCcCci: {
    marginVertical: UI_SIZES.spacing.tiny,
  },
  iconClose: {
    marginVertical: UI_SIZES.spacing.tinyExtra,
  },
  input: {
    ...TextSizeStyle.Medium,
    lineHeight: undefined,
    paddingVertical: UI_SIZES.spacing.tiny + UI_SIZES.spacing.tinyExtra,
  },
  loading: {
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.tiny,
    flexDirection: 'row',
  },
  middlePart: {
    flex: 1,
    rowGap: UI_SIZES.spacing.minor,
  },
  nbResults: {
    marginBottom: UI_SIZES.spacing.small,
  },
  noResults: {
    paddingTop: UI_SIZES.spacing.medium,
    rowGap: UI_SIZES.spacing.small,
  },
  noResultsText: {
    textAlign: 'center',
  },
  prefix: {
    color: theme.palette.grey.graphite,
    paddingVertical: UI_SIZES.spacing.tiny,
  },
  recipientsList: {
    columnGap: UI_SIZES.spacing.minor,
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: UI_SIZES.spacing.minor,
  },
  results: {
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.small,
  },
  resultsList: {
    backgroundColor: theme.palette.grey.white,
    position: 'absolute',
    width: '100%',
    zIndex: 99,
  },
  subjectInput: {
    flex: 1,
  },
  textButton: {
    color: theme.palette.primary.regular,
  },
  viewResults: {
    position: 'absolute',
    width: '100%',
    zIndex: 99,
  },
});
