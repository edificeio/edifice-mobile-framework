import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  bottomContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  button: {
    marginBottom: UI_SIZES.spacing.big,
  },
  description: {
    marginTop: UI_SIZES.spacing.medium,
    textAlign: 'center',
  },
  page: {
    paddingHorizontal: UI_SIZES.spacing.large,
    paddingVertical: UI_SIZES.spacing.big,
  },
  title: {
    marginTop: UI_SIZES.spacing.big,
  },
  topContainer: {
    alignItems: 'center',
  },
});
