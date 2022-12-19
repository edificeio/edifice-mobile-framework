import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  buttonLine_text: {
    flex: 1,
    color: theme.ui.text.regular,
  },
  buttonLine_icon: {
    transform: [{ rotate: '270deg' }],
  },
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: theme.ui.background.card,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: theme.palette.grey.cloudy,
    justifyContent: 'flex-start',
    padding: UI_SIZES.spacing.medium,
  },
  containerAlone: {
    borderBottomWidth: 1,
    borderRadius: 16,
  },
  containerFirst: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  containerLast: {
    borderBottomWidth: 1,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
});
