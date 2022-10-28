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
import { ActionButton, ActionButtonProps } from '~/framework/components/ActionButton';
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
  dropDownPickerProps: Omit<DropDownPickerProps, OptionalDropDownPickerProps> &
    Partial<Pick<DropDownPickerProps, OptionalDropDownPickerProps>>;
  button?: Omit<ActionButtonProps, 'action' | 'url'> & {
    action?: (value: Parameters<Required<DropDownPickerProps>['onChangeValue']>[0]) => void;
    url?: string | ((value: Parameters<Required<DropDownPickerProps>['onChangeValue']>[0]) => string);
  };
}

export default function DropdownSelectorTemplate(props: DropdownSelectorTemplateProps) {
  const [dropdownOpen, setDropdownOpened] = React.useState<boolean>(false);
  const [selected, setSelected] = React.useState<DropDownPickerProps['value']>(props.dropDownPickerProps.value);
  const {
    open,
    value,
    setValue,
    style,
    setOpen,
    textStyle,
    dropDownContainerStyle,
    placeholderStyle,
    ...otherDropdownPickerProps
  } = props.dropDownPickerProps;

  return (
    <TouchableWithoutFeedback
      style={DropdownSelectorTemplate.styles.selectBackDrop}
      onPress={() => {
        setDropdownOpened(false);
      }}>
      <View style={DropdownSelectorTemplate.styles.container}>
        {props.picture ? <Picture {...props.picture} /> : null}
        {props.message ? <BodyText style={DropdownSelectorTemplate.styles.text}>{props.message}</BodyText> : null}
        <View>
          <DropDownPicker
            open={open ?? dropdownOpen}
            dropDownContainerStyle={[DropdownSelectorTemplate.styles.selectContainer, dropDownContainerStyle]}
            placeholderStyle={[DropdownSelectorTemplate.styles.selectPlaceholder, placeholderStyle]}
            setOpen={setOpen ?? (() => setDropdownOpened(prev => !prev))}
            style={[DropdownSelectorTemplate.styles.select, style]}
            textStyle={[DropdownSelectorTemplate.styles.selectText, textStyle]}
            value={selected}
            setValue={setSelected as DropDownPickerProps['setValue']}
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
  selected: DropDownPickerProps['value'],
) => {
  const { action, url, disabled, ...otherButtonProps } = buttonProps;
  return (
    <ActionButton
      action={typeof action === 'function' ? () => action(selected) : action}
      url={typeof url === 'function' ? url(selected) : url}
      disabled={Array.isArray(selected) ? selected.length === 0 : !selected}
      {...otherButtonProps}
    />
  );
};

DropdownSelectorTemplate.styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-around',
    paddingHorizontal: UI_SIZES.spacing.large,
    paddingVertical: UI_SIZES.spacing.huge,
    flexBasis: '66%',
    flexGrow: 0,
    flexShrink: 1,
  },
  help: { marginTop: UI_SIZES.spacing.large, textAlign: 'center' },
  safeView: { flex: 1, backgroundColor: theme.ui.background.card },
  select: { borderColor: theme.palette.primary.regular, borderWidth: 1, marginVertical: UI_SIZES.spacing.large },
  selectBackDrop: { flex: 1 },
  selectContainer: {
    borderColor: theme.palette.primary.regular,
    borderWidth: 1,
    maxHeight: 120,
    marginVertical: UI_SIZES.spacing.large,
  },
  selectPlaceholder: { color: theme.ui.text.light },
  selectText: { color: theme.ui.text.light },
  text: {
    textAlign: 'center',
    marginVertical: UI_SIZES.spacing.large,
  },
});
