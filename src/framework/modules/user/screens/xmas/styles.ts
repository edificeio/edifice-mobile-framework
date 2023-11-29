import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  hintText: {
    flex: 1,
  },
  informationBar: {
    backgroundColor: theme.palette.complementary.blue.regular,
    width: 5,
    height: '100%',
    borderTopLeftRadius: UI_SIZES.radius.medium,
    borderBottomLeftRadius: UI_SIZES.radius.medium,
  },
  informationContainer: {
    borderWidth: UI_SIZES.elements.border.default,
    borderColor: theme.palette.complementary.blue.regular,
    marginTop: UI_SIZES.spacing.medium,
    borderRadius: UI_SIZES.radius.medium,
    flexDirection: 'row',
    alignItems: 'center',
  },
  informationIcon: {
    marginHorizontal: UI_SIZES.spacing.minor,
  },
  page: {
    padding: UI_SIZES.spacing.medium,
    paddingBottom: 0,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginTop: UI_SIZES.spacing.medium,
    justifyContent: 'space-between',
  },
  wishTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  xmasTree: {
    position: 'absolute',
    bottom: UI_SIZES.spacing.minor,
    right: -UI_SIZES.spacing.small,
  },
  xmasTreeContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  xmasTreeSubcontainer: {
    flex: 1,
  },
});
