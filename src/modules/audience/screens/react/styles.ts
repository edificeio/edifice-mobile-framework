import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  picker: {
    alignSelf: 'flex-start',
    backgroundColor: theme.palette.grey.white,
    borderColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.medium,
    borderWidth: UI_SIZES.border.thin,
    elevation: 16,
    flexDirection: 'row',
    position: 'absolute',
    shadowColor: theme.ui.shadowColor,
    shadowOffset: {
      height: 4,
      width: 0,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  pickerItem: {
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.medium,
  },
  pickerLabel: {
    backgroundColor: theme.palette.grey.black,
    borderRadius: UI_SIZES.radius.medium,
    paddingHorizontal: UI_SIZES.spacing.minor,
    paddingVertical: UI_SIZES.spacing._LEGACY_tiny,
    position: 'absolute',
    top: -30,
  },
  pickerLabelText: {
    color: theme.palette.grey.white,
    textAlign: 'center',
  },
});

export const REACTION_ICON_SIZE = 30;
/** Width of one reaction in the picker. */
export const PICKER_ITEM_WIDTH = REACTION_ICON_SIZE + styles.pickerItem.paddingHorizontal * 2;
export const PICKER_HEIGHT = REACTION_ICON_SIZE + styles.pickerItem.paddingVertical * 2 + styles.picker.borderWidth * 2;
export const getPickerWidth = (count: number) => PICKER_ITEM_WIDTH * count + styles.picker.borderWidth * 2;

/** Position of the picker in the modal: above the react button (`anchor`), both in the coordinates of the page. */
export const getPickerPosition = (anchor: { x: number; y: number }, modalOrigin: { x: number; y: number }) => ({
  left: anchor.x - modalOrigin.x,
  top: anchor.y - PICKER_HEIGHT - modalOrigin.y,
});

export default styles;
