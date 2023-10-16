import * as React from 'react';
import { View } from 'react-native';
import DropDownPicker, { ValueType } from 'react-native-dropdown-picker';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Picture } from '~/framework/components/picture';
import { BodyItalicText, BodyText } from '~/framework/components/text';

import DropdownListItem from './list-item';
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

  return (
    <DropDownPicker
      {...props}
      BodyComponent={renderBody}
      ArrowUpIconComponent={renderArrowUpIcon}
      ArrowDownIconComponent={renderArrowDownIcon}
      renderListItem={DropdownListItem}
      disableBorderRadius={false}
      textStyle={styles.text}
      dropDownContainerStyle={styles.dropdownContainer}
      flatListProps={{
        style: styles.dropdownListContainer,
        contentContainerStyle: styles.dropdownListContentContainer,
      }}
      {...getToggleStyle(type, size, open, value !== null, style)}
    />
  );
};
