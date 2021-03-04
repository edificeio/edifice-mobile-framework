import * as React from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import { CommonStyles } from "../../styles/common/styles";
import { Icon } from "../../ui";
import { ModalBox, ModalContent, ModalContentBlock } from "../../ui/Modal";

const list = ["zimbra", "cdt", "user", "toto", "superduperlongnameinordertotestifitisfunctional", "zimbra", "cdt", "user", "toto", "superduperlongnameinordertotestifitisfunctional", "zimbra", "cdt", "user", "toto", "superduperlongnameinordertotestifitisfunctional"];

const ListPickerModal = ({ list, isVisible, onChange }) => {
  return (
    <ModalBox isVisible={isVisible}>
      <ModalContent style={{ alignItems: "flex-start" }}>
        <ModalContentBlock>
          <ScrollView>
            {list.map((elem, index) => (
              <TouchableOpacity onPress={() => onChange(elem)}>
                <Text style={styles.textElem} numberOfLines={1}>
                  {elem}
                </Text>
                {index < list.length - 1 && <View style={styles.lineSeparator} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </ModalContentBlock>
      </ModalContent>
    </ModalBox>
  );
};

// EXPORTED COMPONENTS

export const ListPicker = ({ ticket, onFieldChange }) => {
  const [isVisible, toggleVisible] = React.useState(false);
  const [currentValue, updateCurrentValue] = React.useState<string>();
  function onChange(value) {
    updateCurrentValue(value);
    onFieldChange({ ...ticket, value });
    toggleVisible(false);
  }
  return (
    <View style={{ flex: 1 }}>
      {list.length > 0 && (
        <TouchableOpacity style={styles.select} onPress={() => toggleVisible(!isVisible)}>
          <View
            style={{
              flex: 1,
              alignItems: "flex-end",
              flexDirection: "row",
              justifyContent: "flex-end",
              marginRight: 5,
            }}>
            <Text style={{ marginRight: 20 }} numberOfLines={1}>
              {currentValue}
            </Text>
            <Icon size={15} color={CommonStyles.grey} name="arrow_down" />
          </View>
        </TouchableOpacity>
      )}
      <ListPickerModal list={list} isVisible={isVisible} onChange={onChange} />
    </View>
  );
};

export const FormInputs = ({ onChange }: React.PropsWithChildren<{ onChange }>) => {
  const textUpdateTimeout = React.useRef();
  const [currentValue, updateCurrentValue] = React.useState<string>();

  React.useEffect(() => {
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
  select: {
    minWidth: "60%",
    minHeight: 30,
    paddingTop: 10,
  },
  textElem: {
    fontSize: 16,
    marginVertical: 15,
  },
  lineSeparator: {
    width: "100%",
    borderColor: CommonStyles.grey,
    borderBottomWidth: 1,
    borderRadius: 1,
  },
});
