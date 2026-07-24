import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: theme.palette.grey.white,
    borderColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.card,
    borderWidth: 2,
    flex: 1,
    padding: UI_SIZES.spacing.medium,
  },
  cardSelected: {
    borderColor: theme.palette.status.success.regular,
  },
  check: {
    alignSelf: 'flex-end',
    height: UI_SIZES.dimensions.height.large,
  },
  page: {
    backgroundColor: theme.palette.grey.white,
    padding: UI_SIZES.spacing.big,
  },
  preview: {
    borderRadius: UI_SIZES.radius.medium,
    height: 90,
    marginVertical: UI_SIZES.spacing.small,
    overflow: 'hidden',
    width: '100%',
  },
  previewBottom: {
    flex: 1,
  },
  previewTop: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: UI_SIZES.spacing.medium,
    marginTop: UI_SIZES.spacing.big,
  },
  text: {
    marginVertical: UI_SIZES.spacing.medium,
  },
  title: {
    color: theme.palette.primary.regular,
  },
});
