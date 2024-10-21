import { StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { DropdownSize, DropdownVariant } from './types';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { TextFontStyle, TextSizeStyle } from '~/framework/components/text';

const styles = StyleSheet.create({
  bigPaddingGhost: {
    paddingHorizontal: UI_SIZES.spacing.minor,
    paddingVertical: UI_SIZES.spacing.minor,
  },
  bigPaddingOutline: {
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.small,
  },
  bodyContainer: {
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.minor,
    flex: 1,
    flexDirection: 'row',
  },
  // eslint-disable-next-line react-native/no-color-literals
  containerGhost: {
    backgroundColor: 'transparent',
    borderRadius: UI_SIZES.radius.medium,
    borderWidth: 0,
    minHeight: 0,
  },
  containerOutline: {
    backgroundColor: theme.palette.grey.white,
    borderColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.medium,
    borderWidth: 1,
    minHeight: 0,
  },
  disabledContainerGhost: {
    backgroundColor: theme.palette.grey.white,
  },
  disabledContainerOutline: {
    backgroundColor: theme.palette.grey.fog,
    borderColor: theme.palette.grey.grey,
  },
  disabledText: {
    color: theme.palette.grey.stone,
  },
  dropdownContainer: {
    backgroundColor: theme.palette.grey.white,
    borderRadius: UI_SIZES.radius.mediumPlus,
    borderWidth: 0,
    elevation: 10,
    maxHeight: 300,
    overflow: 'visible',
    shadowColor: theme.ui.shadowColor,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  dropdownItemContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  dropdownListContainer: {
    borderRadius: UI_SIZES.radius.mediumPlus,
  },
  dropdownListContentContainer: {
    paddingHorizontal: UI_SIZES.spacing.minor,
    paddingVertical: UI_SIZES.spacing.small,
    rowGap: UI_SIZES.spacing.tiny,
  },
  mediumPaddingOutline: {
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.minor,
  },
  selectedContainerGhost: {
    backgroundColor: theme.palette.primary.pale,
  },
  text: {
    ...TextFontStyle.Regular,
    ...TextSizeStyle.Medium,
  },
});

export const getToggleStyle = (
  type: DropdownVariant,
  size: DropdownSize,
  isOpened: boolean,
  isItemSelected: boolean,
  style?: StyleProp<ViewStyle>
) => {
  if (type === 'outlined') {
    return {
      disabledStyle: styles.disabledContainerOutline,
      style: [
        styles.containerOutline,
        size === 'big' ? styles.bigPaddingOutline : styles.mediumPaddingOutline,
        {
          borderColor: isOpened
            ? theme.palette.primary.light
            : isItemSelected
              ? theme.palette.grey.graphite
              : theme.palette.grey.cloudy,
        },
        style,
      ],
    };
  } else {
    return {
      disabledStyle: styles.disabledContainerGhost,
      style: [styles.containerGhost, styles.bigPaddingGhost, isOpened && styles.selectedContainerGhost, style],
    };
  }
};

export default styles;
