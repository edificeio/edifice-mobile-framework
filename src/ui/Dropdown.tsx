import { Picker } from "@react-native-community/picker";
import I18n from "i18n-js";
import * as React from "react";
import { useState } from "react";
import { View, StyleSheet, ViewStyle, Platform } from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

import { Icon, ButtonsOkCancel } from ".";
import { CommonStyles } from "../styles/common/styles";
import { ModalBox, ModalContent, ModalContentBlock, ModalContentText } from "./Modal";
import { TextBold } from "./text";

interface IDropdownProps {
  style?: ViewStyle;
  value?: string;
  data: any[];
  onSelect: (item: string) => void;
  renderItem?: (item: any) => string;
  keyExtractor?: (item: any) => string;
  placeholder?: string;
}

const styles = StyleSheet.create({
  selected: {
    borderRadius: 5,
    borderColor: CommonStyles.grey,
    borderWidth: 2,
    borderStyle: "solid",
    backgroundColor: "white",
  },
  dropdown: {
    backgroundColor: CommonStyles.white,
    elevation: CommonStyles.elevation,
    shadowColor: CommonStyles.shadowColor,
    shadowOffset: CommonStyles.shadowOffset,
    shadowOpacity: CommonStyles.shadowOpacity,
    shadowRadius: CommonStyles.shadowRadius,
    position: "absolute",
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    zIndex: 1,
  },
});

const DropdownAndroid = ({ style, data, value, onSelect, renderItem, keyExtractor }: IDropdownProps) => {
  const getItemRenderer = renderItem ? renderItem : item => item.toString();
  const getItemKeyExtractor = keyExtractor ? keyExtractor : item => item.toString();

  return (
    <View style={[styles.selected, { flex: 1 }, style]}>
      <Picker
        style={{
          color: CommonStyles.textColor,
        }}
        selectedValue={value}
        onValueChange={(key, value) => onSelect(key as string)}>
        {data.map(item => (
          <Picker.Item label={getItemRenderer(item)} value={getItemKeyExtractor(item)} />
        ))}
      </Picker>
    </View>
  );
};

const DropdownIOS = ({ renderItem, keyExtractor, style, data, placeholder, value, onSelect }: IDropdownProps) => {
  const getItemRenderer = renderItem ? renderItem : item => item.toString();
  const getItemKeyExtractor = keyExtractor ? keyExtractor : item => item.toString();

  const [visible, toggleModal] = useState(false);
  const [selected, selectValue] = useState(value);

  return (
    <View style={{ flex: 1 }}>
      <TouchableWithoutFeedback
        style={[styles.selected, { padding: 10, flexDirection: "row", alignItems: "center" }, style]}
        onPress={() => toggleModal(true)}>
        <TextBold style={{ flex: 1 }}>
          {placeholder
            ? placeholder
            : value
            ? getItemRenderer(data.find(item => getItemKeyExtractor(item) == value))
            : " "}
        </TextBold>
        <Icon size={20} name="arrow_down" />
      </TouchableWithoutFeedback>
      <ModalBox isVisible={visible} onDismiss={() => toggleModal(false)}>
        <ModalContent style={{ width: 350 }}>
          <View style={{ width: "100%", marginBottom: 35, paddingHorizontal: 20 }}>
            <Picker selectedValue={selected} onValueChange={(value, label) => selectValue(value as string)}>
              {data.map(item => (
                <Picker.Item label={getItemRenderer(item)} value={getItemKeyExtractor(item)} />
              ))}
            </Picker>
          </View>
          <ModalContentBlock>
            <ButtonsOkCancel
              onCancel={() => {
                toggleModal(false);
              }}
              onValid={() => {
                toggleModal(false);
                onSelect(selected);
              }}
              title={I18n.t("common-ok")}
            />
          </ModalContentBlock>
        </ModalContent>
      </ModalBox>
    </View>
  );
};

export default (props: IDropdownProps) => {
  switch (Platform.OS) {
    case "ios": {
      return <DropdownIOS {...props} />;
    }
    default: {
      return <DropdownAndroid {...props} />;
    }
  }
};
