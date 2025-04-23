import { StyleSheet, ViewStyle } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

const listItemBaseStyle: ViewStyle = {
  backgroundColor: theme.palette.grey.white,
  borderColor: theme.palette.grey.cloudy,
  borderLeftWidth: UI_SIZES.border.thin,
  borderRightWidth: UI_SIZES.border.thin,
  marginHorizontal: UI_SIZES.spacing.big,
  paddingHorizontal: UI_SIZES.spacing.medium,
  paddingVertical: UI_SIZES.spacing.small,
};

const childItemBaseStyle = {
  marginLeft: UI_SIZES.spacing.major,
};

const styles = StyleSheet.create({
  bottomSheetFocusedItem: {
    backgroundColor: theme.palette.primary.pale,
    borderRadius: UI_SIZES.radius.card,
  },
  bottomSheetListContainer: {
    paddingBottom: UI_SIZES.spacing.big + UI_SIZES.screen.bottomInset,
    paddingHorizontal: UI_SIZES.spacing.big,
    paddingTop: 0,
  },
  hiddenListItemText: {
    flex: 1,
    justifyContent: 'flex-start',
    marginRight: UI_SIZES.spacing.minor,
  },
  listContainer: {
    paddingBottom: UI_SIZES.spacing.big,
  },
  listItemContent: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  listItemLayoutBordered: {
    borderColor: theme.palette.grey.cloudy,
    borderLeftWidth: UI_SIZES.border.thin,
    borderRightWidth: UI_SIZES.border.thin,
    marginHorizontal: UI_SIZES.spacing.big,
  },
  listItemLayoutBorderless: {
    borderRadius: UI_SIZES.radius.card,
  },
  listItemLayoutChild: {},
  listItemLayoutChildBordered: {
    marginLeft: UI_SIZES.spacing.major,
    marginTop: -UI_SIZES.spacing.minor,
  },
  listItemLayoutChildBorderless: {
    marginLeft: UI_SIZES.spacing.medium + UI_SIZES.spacing.tiny,
  },
  listItemLayoutChildFirst: {},
  listItemLayoutChildFirstBordered: {
    marginTop: -UI_SIZES.spacing.minor - UI_SIZES.border.normal + UI_SIZES.border.thin,
    paddingTop: UI_SIZES.spacing.minor + UI_SIZES.border.normal - UI_SIZES.border.thin,
  },
  listItemLayoutChildFirstBorderless: {},
  listItemLayoutChildLast: {},
  listItemLayoutChildLastBordered: {
    borderBottomLeftRadius: UI_SIZES.radius.card,
    borderBottomRightRadius: UI_SIZES.radius.card,
    borderBottomWidth: UI_SIZES.border.normal,
    paddingBottom: UI_SIZES.spacing.minor + UI_SIZES.border.normal - UI_SIZES.border.thin,
  },
  listItemLayoutChildLastBorderless: {},
  listItemLayoutCommon: {
    backgroundColor: theme.palette.grey.white,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.minor,
  },
  listItemLayoutParent: {},
  listItemLayoutParentBordered: {
    borderBottomWidth: UI_SIZES.border.normal,
    borderRadius: UI_SIZES.radius.card,
    borderTopWidth: UI_SIZES.border.thin,
    paddingVertical: UI_SIZES.spacing.small,
  },
  listItemLayoutParentBorderless: {},
  listItemLayoutParentWithChildren: {},
  listItemLayoutParentWithChildrenBordered: {
    borderBottomRightRadius: 0,
  },
  listItemLayoutParentWithChildrenBorderless: {},
  spacingItem: {
    height: UI_SIZES.spacing.minor,
  },
});

export default styles;
