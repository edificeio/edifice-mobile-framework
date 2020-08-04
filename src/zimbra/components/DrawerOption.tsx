import React from "react";
import { StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

import { Icon } from "../../ui";
import { TextBold, Text } from "../../ui/Typography";

type DrawerOptionProps = {
  label: string;
  selected: boolean;
  iconName: string;
  navigate: () => any;
};

export default class DrawerOption extends React.PureComponent<DrawerOptionProps> {
  public render() {
    const { label, selected, iconName, navigate } = this.props;
    const touchableStyle = selected ? [style.item, style.selectedItem] : style.item;
    const iconStyle = selected ? [style.itemIcon, { color: "white" }] : style.itemIcon;
    return (
      <TouchableOpacity style={touchableStyle} onPress={navigate} disabled={selected}>
        <Icon size={16} name={iconName} style={iconStyle} />
        {selected ? (
          <TextBold style={[style.itemTextSelected, style.itemText]}>{label}</TextBold>
        ) : (
          <Text style={style.itemText}>{label}</Text>
        )}
      </TouchableOpacity>
    );
  }
}

const style = StyleSheet.create({
  item: {
    padding: 7,
    marginBottom: 8,
    backgroundColor: "white",
    flexDirection: "row",
  },
  selectedItem: {
    backgroundColor: "orange",
  },
  itemText: {
    marginLeft: 5,
    fontSize: 18,
  },
  itemTextSelected: {
    color: "white",
  },
  itemIcon: {
    alignSelf: "center",
  },
});
