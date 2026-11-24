import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import type { AudienceRect } from '~/modules/audience/model';

const styles = StyleSheet.create({
  background: {
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
const PICKER_HEIGHT = REACTION_ICON_SIZE + styles.pickerItem.paddingVertical * 2 + styles.picker.borderWidth * 2;
const getPickerWidth = (count: number) => PICKER_ITEM_WIDTH * count + styles.picker.borderWidth * 2;

/** Where the picker is, in the coordinates of the window: above the react button (`anchor`). */
export const getPickerRect = (anchor: AudienceRect, count: number): AudienceRect => ({
  height: PICKER_HEIGHT,
  width: getPickerWidth(count),
  x: anchor.x,
  y: anchor.y - PICKER_HEIGHT,
});

export default styles;
