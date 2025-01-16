import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

export default StyleSheet.create({
  textButton: {
    color: theme.palette.primary.regular,
  },
  container: {
    borderBottomWidth: UI_SIZES.border.thin,
    borderColor: theme.palette.primary.light,
    columnGap: UI_SIZES.spacing.minor,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.small,
  },
  containerInput: {
    flex: 1,
    flexDirection: 'row',
    columnGap: UI_SIZES.spacing.tiny,
  },
  containerIsEditing: {
    alignItems: 'flex-end',
  },
  input: {
    ...TextSizeStyle.Medium,
    lineHeight: undefined,
    paddingVertical: UI_SIZES.spacing.tiny + UI_SIZES.spacing.tinyExtra,
    flex: 1,
  },
  middlePart: {
    flex: 1,
    rowGap: UI_SIZES.spacing.minor,
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
  iconClose: {
    marginVertical: UI_SIZES.spacing.tinyExtra,
  },
  iconCcCci: {
    marginVertical: UI_SIZES.spacing.tiny,
  },
  nbResults: {
    marginBottom: UI_SIZES.spacing.small,
  },
  results: {
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.small,
  },
});
