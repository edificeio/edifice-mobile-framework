/**
 * DropdownSelector
 * = Template =
 *
 * A view that show a single dropdown picker and a validate button.
 */
import * as React from 'react';
import { StyleSheet, TouchableWithoutFeedback, View } from 'react-native';

import DropDownPicker, { DropDownPickerProps } from 'react-native-dropdown-picker';

import theme from '~/app/theme';
import PrimaryButton, { PrimaryButtonProps } from '~/framework/components/buttons/primary';
import { UI_SIZES } from '~/framework/components/constants';
import { Picture, PictureProps } from '~/framework/components/picture';
import { BodyText } from '~/framework/components/text';

type OptionalDropDownPickerProps =
  | 'open'
  | 'value'
  | 'setValue'
  | 'style'
  | 'setOpen'
  | 'textStyle'
  | 'dropDownContainerStyle'
  | 'placeholderStyle';
export interface DropdownSelectorTemplateProps {
  picture?: PictureProps;
  message?: string;
  dropDownPickerProps: Omit<DropDownPickerProps<any>, OptionalDropDownPickerProps> &
    Partial<Pick<DropDownPickerProps<any>, OptionalDropDownPickerProps>>;
  button?: Omit<PrimaryButtonProps, 'action' | 'url'> & {
    action?: (value: Parameters<Required<DropDownPickerProps<any>>['onChangeValue']>[0]) => void;
    url?: string | ((value: Parameters<Required<DropDownPickerProps<any>>['onChangeValue']>[0]) => string);
  };
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    flexBasis: '66%',
    flexGrow: 0,
    flexShrink: 1,
    justifyContent: 'space-around',
    paddingHorizontal: UI_SIZES.spacing.large,
    paddingVertical: UI_SIZES.spacing.huge,
  },
  select: { borderColor: theme.palette.primary.regular, borderWidth: 1, marginVertical: UI_SIZES.spacing.large },
  selectBackDrop: { flex: 1 },
  selectContainer: {
    borderColor: theme.palette.primary.regular,
    borderWidth: 1,
    marginVertical: UI_SIZES.spacing.large,
    maxHeight: 120,
  },
  selectPlaceholder: { color: theme.ui.text.light },
  selectText: { color: theme.ui.text.light },
  text: {
    marginVertical: UI_SIZES.spacing.large,
    textAlign: 'center',
  },
});

export default function DropdownSelectorTemplate(props: DropdownSelectorTemplateProps) {
  const [dropdownOpen, setDropdownOpened] = React.useState<boolean>(false);
  const [selected, setSelected] = React.useState<DropDownPickerProps<any>['value']>(props.dropDownPickerProps.value);
  const {
    dropDownContainerStyle,
    open,
    placeholderStyle,
    setOpen,
    setValue,
    style,
    textStyle,
    value,
    ...otherDropdownPickerProps
  } = props.dropDownPickerProps;

  return (
    <TouchableWithoutFeedback
      style={styles.selectBackDrop}
      onPress={() => {
        setDropdownOpened(false);
      }}>
      <View style={styles.container}>
        {props.picture ? <Picture {...props.picture} /> : null}
        {props.message ? <BodyText style={styles.text}>{props.message}</BodyText> : null}
        <View>
          {/* I don't know how to fix this lint error. Seems to ba a typeing issue with react-native-dropdown-picker */}
          <DropDownPicker
            open={open ?? dropdownOpen}
            dropDownContainerStyle={[styles.selectContainer, dropDownContainerStyle]}
            placeholderStyle={[styles.selectPlaceholder, placeholderStyle]}
            setOpen={setOpen ?? (() => setDropdownOpened(prev => !prev))}
            style={[styles.select, style]}
            textStyle={[styles.selectText, textStyle]}
            value={selected}
            setValue={setSelected as DropDownPickerProps<any>['setValue']}
            {...otherDropdownPickerProps}
          />
          {props.button ? DropdownSelectorTemplate.renderButton(props.button, selected) : null}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

DropdownSelectorTemplate.renderButton = (
  buttonProps: Required<DropdownSelectorTemplateProps>['button'],
  selected: DropDownPickerProps<any>['value'],
) => {
  const { action, disabled, url, ...otherButtonProps } = buttonProps;
  return (
    <PrimaryButton
      action={typeof action === 'function' ? () => action(selected) : action}
      url={typeof url === 'function' ? url(selected) : url}
      disabled={Array.isArray(selected) ? selected.length === 0 : !selected}
      {...otherButtonProps}
    />
  );
};
