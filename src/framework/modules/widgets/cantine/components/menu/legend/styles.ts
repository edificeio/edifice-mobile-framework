import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleFontSize, UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    backgroundColor: theme.palette.grey.white,
    borderRadius: UI_SIZES.radius.medium,
    marginVertical: UI_SIZES.spacing.large,
    padding: UI_SIZES.spacing.medium,
  },
  icon: {
    height: UI_SIZES.elements.icon.xsmall,
    marginRight: UI_SIZES.spacing.tiny,
    width: UI_SIZES.elements.icon.xsmall,
  },
  item: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: UI_SIZES.spacing.tiny,
    width: '48%',
  },
  items: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  text: {
    color: theme.palette.grey.black,
    flex: 1,
    fontSize: getScaleFontSize(12),
  },
  title: {
    color: theme.palette.grey.black,
    fontSize: getScaleFontSize(14),
    marginBottom: UI_SIZES.spacing.tiny,
  },
});
