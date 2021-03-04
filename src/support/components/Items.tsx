import * as React from "react";
import { StyleSheet, TextInput, TouchableOpacity, View, ViewStyle } from "react-native";

import { CommonStyles } from "../../styles/common/styles";
import { Icon } from "../../ui";
import Dropdown from "../../ui/Dropdown";
import { IApp, IEstablishment } from "../containers/Support";

export const EstablishmentPicker = ({
  list,
  onFieldChange,
}: {
  list: IEstablishment[];
  onFieldChange: (field: string) => void;
}) => {
  const [currentValue, updateCurrentValue] =
    list.length > 0 ? React.useState<string>(list[0].name) : React.useState<string>();
  return (
    <View style={{ flex: 1 }}>
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
  const [currentValue, updateCurrentValue] =
    list.length > 0 ? React.useState<string>(list[0].displayName) : React.useState<string>();
  return (
    <View style={{ flex: 1 }}>
      <Dropdown
        style={styles.dropdown}
        data={list.map(x => x.displayName)}
        value={currentValue}
        onSelect={(key: string) => {
          const elem = list.find(item => item.displayName === key);
          if (elem !== undefined && elem.displayName !== currentValue) {
            updateCurrentValue(elem.displayName);
            onFieldChange(elem.address);
          }
        }}
        renderItem={(item: string) => item}
      />
    </View>
  );
};

export const FormInputs = ({ fieldName, onChange }: { fieldName: string; onChange: (field: string) => void }) => {
  const textInputStyle = {
    flex: 1,
    marginHorizontal: 10,
    color: CommonStyles.textColor,
    borderBottomColor: "#EEEEEE",
    borderBottomWidth: 2,
  } as ViewStyle;
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

  return fieldName === "subject" ? (
    <TextInput style={textInputStyle} numberOfLines={1} onChangeText={text => updateCurrentValue(text)} />
  ) : (
    <TextInput style={textInputStyle} multiline onChangeText={text => updateCurrentValue(text)} />
  );
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
