import * as React from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import { CommonStyles } from "../../styles/common/styles";
import { Icon } from "../../ui";
import Dropdown from "../../ui/Dropdown";

export const ListPicker = ({ list, onFieldChange }) => {
  const [currentValue, updateCurrentValue] =
    list.length > 0 ? React.useState<string>(list[0]) : React.useState<string>();
  return (
    <View style={{ flex: 1 }}>
      <Dropdown
        style={styles.dropdown}
        data={list}
        value={currentValue}
        onSelect={(elem: string) => {
          if (elem !== currentValue) {
            updateCurrentValue(elem);
            onFieldChange(elem);
          }
        }}
        renderItem={(item: string) => item}
      />
    </View>
  );
};

export const FormInputs = ({ onChange }: React.PropsWithChildren<{ onChange }>) => {
  const textUpdateTimeout = React.useRef();
  const [currentValue, updateCurrentValue] = React.useState<string>();
  const notFirstRender = React.useRef(false);

  React.useEffect(() => {
    if (!notFirstRender.current) {
      // avoid onChange when useState initialize
      notFirstRender.current = true;
      return;
    }
    window.clearTimeout(textUpdateTimeout.current);
    textUpdateTimeout.current = window.setTimeout(() => onChange(currentValue), 500);

    return () => {
      window.clearTimeout(textUpdateTimeout.current);
    };
  }, [currentValue]);

  return <TextInput numberOfLines={1} onChangeText={text => updateCurrentValue(text)} />;
};

export const IconButton = ({ icon, color, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Icon size={30} color={color} name={icon} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    backgroundColor: "transparent",
    borderRadius: 0,
    borderWidth: 0,
    borderBottomWidth: 2,
    borderBottomColor: CommonStyles.grey,
  },
});
