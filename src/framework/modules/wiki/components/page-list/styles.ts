import { StyleSheet, ViewStyle } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

const listItemBaseStyle: ViewStyle = {
  backgroundColor: theme.palette.grey.white,
  borderColor: theme.palette.grey.cloudy,
  borderLeftWidth: UI_SIZES.border.thin,
  borderRightWidth: UI_SIZES.border.thin,
  paddingHorizontal: UI_SIZES.spacing.medium,
  paddingVertical: UI_SIZES.spacing.small,
};

const childItemBaseStyle = {
  marginLeft: UI_SIZES.spacing.major,
  marginTop: -UI_SIZES.spacing.small + UI_SIZES.border.thin,
};

const bottomSheetItemBaseStyle: ViewStyle = {
  paddingVertical: UI_SIZES.spacing.minor,
};

const styles = StyleSheet.create({
  bottomSheetChild: {
    ...bottomSheetItemBaseStyle,
    paddingLeft: UI_SIZES.spacing.large + UI_SIZES.spacing.tiny,
    paddingRight: UI_SIZES.spacing.medium,
  },
  bottomSheetFocusedItem: {
    backgroundColor: theme.palette.primary.pale,
    borderRadius: UI_SIZES.radius.card,
  },
  bottomSheetListContainer: {
    paddingBottom: UI_SIZES.spacing.big + UI_SIZES.screen.bottomInset,
    paddingHorizontal: UI_SIZES.spacing.big,
    paddingTop: 0,
  },
  bottomSheetRootLevelItem: {
    ...bottomSheetItemBaseStyle,
    paddingHorizontal: UI_SIZES.spacing.medium,
  },
  firstChild: {
    ...listItemBaseStyle,
    ...childItemBaseStyle,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  hiddenListItemText: {
    flex: 1,
    justifyContent: 'flex-start',
    marginRight: UI_SIZES.spacing.minor,
  },
  lastChild: {
    ...listItemBaseStyle,
    ...childItemBaseStyle,
    borderBottomRightRadius: UI_SIZES.radius.card,
    borderBottomWidth: 3,
    borderColor: theme.palette.grey.cloudy,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderTopWidth: 0,
  },
  listContainer: {
    paddingBottom: UI_SIZES.spacing.big,
  },
  listItemChildless: {
    ...listItemBaseStyle,
    borderBottomLeftRadius: UI_SIZES.radius.card,
    borderBottomRightRadius: UI_SIZES.radius.card,
    borderBottomWidth: UI_SIZES.border.normal,
    borderRightWidth: UI_SIZES.border.thin,
    borderTopLeftRadius: UI_SIZES.radius.card,
    borderTopRightRadius: UI_SIZES.radius.card,
    borderTopWidth: UI_SIZES.border.thin,
    marginHorizontal: UI_SIZES.spacing.big,
  },
  listItemContent: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  listItemWithChild: {
    ...listItemBaseStyle,
    borderBottomLeftRadius: UI_SIZES.radius.card,
    borderBottomRightRadius: 0,
    borderBottomWidth: UI_SIZES.border.normal,
    borderTopLeftRadius: UI_SIZES.radius.card,
    borderTopRightRadius: UI_SIZES.radius.card,
    borderTopWidth: UI_SIZES.border.thin,
    marginHorizontal: UI_SIZES.spacing.big,
  },
  middleChild: {
    ...listItemBaseStyle,
    ...childItemBaseStyle,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderTopWidth: 0,
  },
  spacingItem: {
    height: UI_SIZES.spacing.minor,
  },
});

export default styles;
