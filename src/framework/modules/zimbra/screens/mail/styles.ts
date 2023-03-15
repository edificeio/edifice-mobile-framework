import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  fullContainer: {
    flex: 1,
  },
  topBar: {
    width: '100%',
    height: 12,
  },
  shadowContainer: {
    flexGrow: 1,
    marginTop: UI_SIZES.spacing.tiny,
    marginBottom: 0,
    flexDirection: 'column-reverse',
    backgroundColor: theme.palette.grey.white,
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: theme.palette.grey.white,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 10,
  },
  marginView: {
    height: 110,
  },
  scrollAlign: {
    height: 1,
  },
  scrollContent: {
    padding: UI_SIZES.spacing.small,
  },
  containerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    width: '100%',
    bottom: 0,
    zIndex: 10,
    elevation: 10,
  },
});
