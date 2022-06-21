import * as React from 'react';
import { StyleSheet, TextInput, View, ViewStyle } from 'react-native';

import theme from '~/app/theme';
import { IApp, IEstablishment } from '~/modules/support/containers/Support';
import { CommonStyles } from '~/styles/common/styles';
import Dropdown from '~/ui/Dropdown';

const styles = StyleSheet.create({
  fullView: {
    flex: 1,
  },
  dropdown: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    borderWidth: 0,
  },
});

export const EstablishmentPicker = ({
  list,
  onFieldChange,
}: {
  list: IEstablishment[];
  onFieldChange: (field: string) => void;
}) => {
  const [currentValue, updateCurrentValue] = list.length > 0 ? React.useState<string>(list[0].name) : React.useState<string>();
  return (
    <View style={styles.fullView}>
      <Dropdown
        style={styles.dropdown}
        data={list.map(x => x.name)}
        value={currentValue}
        onSelect={(key: string) => {
          const elem = list.find(item => item.name === key);
          if (elem !== undefined && elem.name !== currentValue) {
            updateCurrentValue(elem.name);
            onFieldChange(elem.id);
          }
        }}
        renderItem={(item: string) => item}
      />
    </View>
  );
};

export const CategoryPicker = ({ list, onFieldChange }: { list: IApp[]; onFieldChange: (field: string) => void }) => {
  const [currentValue, updateCurrentValue] = list.length > 0 ? React.useState<string>(list[0].name) : React.useState<string>();
  return (
    <View style={styles.fullView}>
      <Dropdown
        style={styles.dropdown}
        data={list.map(x => x.name)}
        value={currentValue}
        onSelect={(key: string) => {
          const elem = list.find(item => item.name === key);
          if (elem !== undefined && elem.name !== currentValue) {
            updateCurrentValue(elem.name);
            onFieldChange(elem.address);
          }
        }}
        renderItem={(item: string) => item}
      />
    </View>
  );
};

export const FormInput = ({
  fieldName,
  onChange,
  setResetter,
}: {
  fieldName: string;
  onChange: (field: string) => void;
  setResetter: (resetter: () => void) => void;
}) => {
  const textInputStyle = {
    flex: 1,
    color: CommonStyles.textColor,
    borderBottomColor: theme.palette.grey.cloudy,
    borderBottomWidth: 2,
  } as ViewStyle;
  const textInputMultiline = {
    maxHeight: 115,
  } as ViewStyle;
  const textUpdateTimeout = React.useRef();
  const [currentValue, updateCurrentValue] = React.useState<string>('');
  const notFirstRender = React.useRef(false);
  setResetter(() => updateCurrentValue(''));

  React.useEffect(() => {
    if (!notFirstRender.current) {
      // avoid onChange when useState initialize
      notFirstRender.current = true;
      return;
    }
    window.clearTimeout(textUpdateTimeout.current);
    textUpdateTimeout.current = window.setTimeout(() => onChange(currentValue), 100);

    return () => {
      window.clearTimeout(textUpdateTimeout.current);
    };
  }, [currentValue]);

  return fieldName === 'subject' ? (
    <TextInput style={textInputStyle} value={currentValue} onChangeText={text => updateCurrentValue(text)} />
  ) : (
    <TextInput
      style={[textInputStyle, textInputMultiline]}
      multiline
      value={currentValue}
      onChangeText={text => updateCurrentValue(text)}
    />
  );
};
