import * as React from 'react';
import { Pressable, View } from 'react-native';
import DropDownPicker, { RenderListItemPropsInterface, ValueType } from 'react-native-dropdown-picker';

import theme from '~/app/theme';
import RadioButton from '~/framework/components/buttons/radio';
import { UI_SIZES } from '~/framework/components/constants';
import { Picture } from '~/framework/components/picture';
import { BodyItalicText, BodyText } from '~/framework/components/text';

import styles, { getToggleStyle } from './styles';
import { DropdownPickerProps } from './types';

export const BUTTON_ICON_SIZE = UI_SIZES.elements.icon.small;

export const DropdownPicker = <T extends ValueType>(props: DropdownPickerProps<T>) => {
  const { disabled, iconName, items, open, placeholder, size = 'big', style, type = 'outline', value } = props;

  const getSelectedItemLabel = (): string => items.find(item => item.value === value)?.label ?? ' ';

  const renderBody = () => (
    <View style={styles.bodyContainer}>
      {iconName ? <Picture type="NamedSvg" name={iconName} width={22} height={22} fill={theme.palette.grey.black} /> : null}
      {value !== null ? (
        <BodyText style={disabled && styles.disabledText}>{getSelectedItemLabel()}</BodyText>
      ) : (
        <BodyItalicText style={disabled && styles.disabledText}>{placeholder}</BodyItalicText>
      )}
    </View>
  );

  const renderArrowUpIcon = () => (
    <Picture
      type="NamedSvg"
      name="ui-rafterUp"
      width={16}
      height={16}
      fill={disabled ? theme.palette.grey.stone : theme.palette.grey.black}
    />
  );

  const renderArrowDownIcon = () => (
    <Picture
      type="NamedSvg"
      name="ui-rafterDown"
      width={16}
      height={16}
      fill={disabled ? theme.palette.grey.stone : theme.palette.grey.black}
    />
  );

  const renderListItem = (itemProps: RenderListItemPropsInterface<T>) => (
    <Pressable onPress={() => itemProps.onPress(itemProps.item)} style={styles.dropdownItemContainer}>
      {itemProps.IconComponent}
      <RadioButton
        isChecked={itemProps.isSelected}
        label={itemProps.label}
        onPress={() => itemProps.onPress(itemProps.item)}
        style={styles.dropdownItemRadioContainer}
      />
    </Pressable>
  );

  return (
    <DropDownPicker
      {...props}
      BodyComponent={renderBody}
      ArrowUpIconComponent={renderArrowUpIcon}
      ArrowDownIconComponent={renderArrowDownIcon}
      renderListItem={renderListItem}
      disableBorderRadius={false}
      textStyle={styles.text}
      dropDownContainerStyle={styles.dropdownContainer}
      listItemContainerStyle={styles.dropdownItemContainer}
      flatListProps={{ contentContainerStyle: styles.dropdownListContentContainer }}
      {...getToggleStyle(type, size, open, style)}
    />
  );
};
