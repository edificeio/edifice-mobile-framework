import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

import { TextSizeStyle } from '../../text';

export default StyleSheet.create({
  container: {
    paddingHorizontal: UI_SIZES.spacing.big,
    paddingVertical: UI_SIZES.spacing.medium,
    borderColor: theme.palette.grey.stone,
    borderWidth: UI_SIZES.border.thin,
    borderRadius: UI_SIZES.radius.selector,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: UI_SIZES.spacing.big,
  },
  week: {
    flex: 1,
    textAlign: 'center',
    alignSelf: 'center',
    marginHorizontal: UI_SIZES.spacing.small,
  },
  weekContainer: {
    flexDirection: 'row',
    height: 2 * TextSizeStyle.Normal.lineHeight,
  },
});
