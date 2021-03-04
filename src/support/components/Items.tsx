import * as React from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import { CommonStyles } from "../../styles/common/styles";
import { Icon } from "../../ui";
import { ModalBox, ModalContent, ModalContentBlock } from "../../ui/Modal";

const list = ["zimbra", "cdt", "user", "toto", "superduperlongnameinordertotestifitisfunctional", "zimbra", "cdt", "user", "toto", "superduperlongnameinordertotestifitisfunctional", "zimbra", "cdt", "user", "toto", "superduperlongnameinordertotestifitisfunctional"];

const ListPickerModal = ({ list, selected, isVisible, toggleVisible }) => {
  return (
    <ModalBox isVisible={isVisible}>
      <ModalContent style={{ alignItems: "flex-start" }}>
        <ModalContentBlock>
          <ScrollView>
            {list.map((elem, index) => (
              <TouchableOpacity
                onPress={() => {
                  selected = elem;
                  toggleVisible(false);
                }}>
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

export const ListPicker = () => {
  const [isVisible, toggleVisible] = React.useState(false);
  let selected = "";
  return (
    <View style={{ flex: 1, alignItems: "flex-end" }}>
      {list.length > 0 && (
        <TouchableOpacity style={styles.select} onPress={() => toggleVisible(!isVisible)}>
          <Text numberOfLines={1}>{selected}</Text>
        </TouchableOpacity>
      )}
      <ListPickerModal list={list} selected={selected} isVisible={isVisible} toggleVisible={toggleVisible} />
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
