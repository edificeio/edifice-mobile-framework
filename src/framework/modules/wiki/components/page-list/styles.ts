import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

const listItemBaseStyle = {
  backgroundColor: theme.palette.grey.white,
  borderColor: theme.palette.grey.cloudy,
  borderLeftWidth: 1,
  borderRightWidth: 1,
  height: getScaleWidth(48),
  marginHorizontal: UI_SIZES.spacing.big,
  paddingHorizontal: UI_SIZES.spacing.medium,
  paddingVertical: UI_SIZES.spacing.small,
};

const indentedItemBaseStyle = {
  marginLeft: UI_SIZES.spacing.medium + UI_SIZES.spacing.big,
  // marginTop: -UI_SIZES.spacing.small,
  marginTop: getScaleWidth(-11), // il y a un décalage avec spacing.small qui vaut 12, donc 11
};

const styles = StyleSheet.create({
  firstChildStyle: {
    ...listItemBaseStyle,
    ...indentedItemBaseStyle,
    borderTopLeftRadius: 0,
    // backgroundColor: 'blue',
    borderTopRightRadius: 0,
  },
  lastChildStyle: {
    ...listItemBaseStyle,
    ...indentedItemBaseStyle,
    borderBottomRightRadius: UI_SIZES.radius.card,
    borderBottomWidth: 3,
    // backgroundColor: 'green',
    borderColor: theme.palette.grey.cloudy,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderTopWidth: 0,
  },
  listItemChildless: {
    ...listItemBaseStyle,
    borderBottomLeftRadius: UI_SIZES.radius.card,
    borderBottomRightRadius: UI_SIZES.radius.card,
    borderBottomWidth: 3,
    borderRightWidth: 1,
    borderTopLeftRadius: UI_SIZES.radius.card,
    borderTopRightRadius: UI_SIZES.radius.card,
    borderTopWidth: 1,
  },
  listItemWithChild: {
    ...listItemBaseStyle,
    borderBottomLeftRadius: UI_SIZES.radius.card,
    // backgroundColor: 'yellow',
    borderBottomRightRadius: 0,
    borderBottomWidth: 3,
    borderTopLeftRadius: UI_SIZES.radius.card,
    borderTopRightRadius: UI_SIZES.radius.card,
    borderTopWidth: 1,
  },
  middleChildStyle: {
    ...listItemBaseStyle,
    ...indentedItemBaseStyle,
    // backgroundColor: 'red',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderTopWidth: 0,
  },
  newPageButton: {
    alignSelf: 'baseline',
    marginLeft: UI_SIZES.spacing.minor,
    marginTop: UI_SIZES.spacing.minor,
  },
  pageListTitle: {
    marginBottom: UI_SIZES.spacing.medium,
    marginHorizontal: UI_SIZES.spacing.big,
  },
  spacingFolder: {
    height: UI_SIZES.spacing.minor,
  },
});

export default styles;
