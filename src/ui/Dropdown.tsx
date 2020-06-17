import * as React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { ScrollView, TouchableWithoutFeedback } from "react-native-gesture-handler";

import { Icon } from ".";
import { CommonStyles } from "../styles/common/styles";
import TouchableOpacity from "./CustomTouchableOpacity";
import { TextBold } from "./text";

interface IDropdownProps<T, V> {
  style?: ViewStyle;
  value?: V;
  data: T[];
  onSelect: (item: V) => void;
  renderItem?: (item: T) => string;
  keyExtractor?: (item: T) => V;
}

interface IDropdownState<V> {
  height: number;
  width: number;
  opened: boolean;
  value?: V;
}

const styles = StyleSheet.create({
  selected: {
    padding: 10,
    borderRadius: 5,
    borderColor: CommonStyles.grey,
    borderWidth: 2,
    borderStyle: "solid",
    flexDirection: "row",
    alignItems: "center",
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
  },
});

export default class Dropdown<T, V> extends React.PureComponent<IDropdownProps<T, V>, IDropdownState<V>> {
  constructor(props) {
    super(props);

    this.state = { value: this.props.value, opened: false, height: 50, width: 200 };
  }

  private getItemRenderer = this.props.renderItem ? this.props.renderItem : item => item.toString();

  private getItemKeyExtractor = this.props.keyExtractor ? this.props.keyExtractor : item => item;

  private getSelectedItem = () => {
    return this.state.value ? this.props.data.find(item => this.getItemKeyExtractor(item) === this.state.value) : null;
  };

  private getData = () => this.props.data.filter(item => this.getItemKeyExtractor(item) !== this.state.value);

  private onLayout = event => {
    this.setState({ height: event.nativeEvent.layout.height, width: event.nativeEvent.layout.width });
  };

  private onPress = (item?) => {
    if (item == null) {
      this.setState(previousState => ({ opened: !previousState.opened }));
    } else {
      this.setState({ value: this.getItemKeyExtractor(item) });
      this.setState(previousState => ({ opened: !previousState.opened }));
      this.props.onSelect(this.getItemKeyExtractor(item));
    }
  };

  private SelectedValue = ({ style, onLayout, onPress, children, displayArrow }) => (
    <TouchableWithoutFeedback onLayout={onLayout} onPress={onPress}>
      <View style={[styles.selected, style]}>
        {children}
        {displayArrow && <Icon size={20} name="chevron-left1" />}
      </View>
    </TouchableWithoutFeedback>
  );

  private Option = ({ onSelect, children }) => (
    <TouchableOpacity style={{ padding: 10 }} onPress={onSelect}>
      <TextBold>{children}</TextBold>
    </TouchableOpacity>
  );

  private Dropdown = ({ data, renderItem }) => {
    return (
      <View
        style={[
          styles.dropdown,
          { top: this.state.height, maxHeight: this.state.height * 6, width: this.state.width },
        ]}>
        <ScrollView>{data.map(item => renderItem(item))}</ScrollView>
      </View>
    );
  };

  public render() {
    const { Dropdown, Option, SelectedValue, onPress, onLayout, getData, getSelectedItem, getItemRenderer } = this;

    const selectedItem = getSelectedItem();

    return (
      <View style={{ flex: 1 }}>
        <SelectedValue
          style={this.props.style}
          onLayout={onLayout}
          onPress={onPress}
          displayArrow={getData().length !== 0}>
          <TextBold style={{ flex: 1 }}>{selectedItem ? getItemRenderer(selectedItem) : " "}</TextBold>
        </SelectedValue>
        {this.state.opened && getData().length > 0 && (
          <Dropdown
            data={getData()}
            renderItem={item => (
              <Option onSelect={() => onPress(item)}>
                <TextBold>{getItemRenderer(item)}</TextBold>
              </Option>
            )}
          />
        )}
      </View>
    );
  }
}
