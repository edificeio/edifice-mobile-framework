import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import theme from "../../../framework/util/theme";
import { Icon } from "../../../ui";
import { TextBold } from "../../../ui/Typography";

type DrawerOptionProps = {
  label: string;
  count?: number;
  selected: boolean;
  iconName: string;
  disabled?: boolean;
  navigate: () => any;
};

export default class DrawerOption extends React.PureComponent<DrawerOptionProps> {
  public render() {
    const { label, selected, iconName, count, navigate, disabled } = this.props;
    const countString = count ? ` (${count})` : "";
    const optionLabel = label + countString;
    return (
      <TouchableOpacity style={style.itemContainer} onPress={navigate} disabled={disabled}>
        <Icon size={25} name={iconName} color={selected ? theme.color.primary.regular : theme.color.text.heavy} />
        <TextBold
          numberOfLines={1}
          style={[style.itemText, selected ? { color: theme.color.primary.regular } : {}]}
        >
          {optionLabel}
        </TextBold>
      </TouchableOpacity>
    );
  }
}

const style = StyleSheet.create({
  itemContainer: {
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  itemText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 14,
    overflow: "hidden",
  }
});
