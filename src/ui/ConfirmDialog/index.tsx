import * as React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { IFile, IItem } from "../../workspace/types/states/items";
import { Item } from "../../workspace/components";
import { DEVICE_WIDTH, layoutSize } from "../../styles/common/layoutSize";

import DialogButtonOk from "./buttonOk";
import DialogButtonCancel from "./buttonCancel";
import DialogContainer from "./container";
import DialogInput from "./input";
import DialogTitle from "./title";

type IProps = {
  title: string;
  input: any;
  okLabel: string;
  selected: Array<IFile>;
  visible: boolean;
  onValid: Function;
  onCancel: Function;
};

export type IState = {
  disabled: boolean;
  value: {
    prefix: string;
    suffix: string;
  };
};

export class ConfirmDialog extends React.Component<IProps, IState> {
  state = {
    disabled: false,
    value: this.getInitialValue(),
  };

  onPress() {
    this.props.onValid({ value: this.getFinalValue() });
  }

  getInitialValue() {
    const { input, selected } = this.props;

    const value = selected.length ? selected[0][input] || "" : "";
    const index = value.lastIndexOf(".");
    const suffix = index > 0 ? value.substring(index) : "";
    const prefix = index > 0 ? value.substring(0, index) : value;

    return {
      prefix,
      suffix,
    };
  }

  setValue(value: string) {
    this.setState({
      value: {
        prefix: value,
        suffix: this.state.value.suffix,
      },
      disabled: value.length === 0,
    });
  }

  getFinalValue() {
    const { prefix, suffix } = this.state.value;

    return `${prefix}${suffix}`;
  }

  fill() {
    const { input, selected, title } = this.props;
    const { prefix } = this.state.value;

    if (input) {
      return (
        <>
          <DialogTitle>{title}</DialogTitle>
          <DialogInput
            value={prefix}
            onChangeText={(value: string) =>
              this.setState({
                value: {
                  prefix: value,
                  suffix: this.state.value.suffix,
                },
                disabled: value.length === 0,
              })
            }
          />
        </>
      );
    } else {
      return (
        <>
          <DialogTitle>{title}</DialogTitle>
          {selected && (
            <View
              style={{
                height: layoutSize.LAYOUT_200,
                maxHeight: layoutSize.LAYOUT_375,
                marginTop: layoutSize.LAYOUT_10,
                marginBottom: layoutSize.LAYOUT_10,
              }}>
              <FlatList
                ItemSeparatorComponent={() => <View style={{ backgroundColor: "#ffffff", width: "100%", height: 0 }} />}
                data={selected}
                keyExtractor={(item: IItem) => item.id}
                renderItem={({ item }) => <Item item={item} simple onEvent={f => f} />}
              />
            </View>
          )}
        </>
      );
    }
  }

  render() {
    const { okLabel } = this.props;
    const { disabled } = this.state;

    return (
      <View>
        <DialogContainer visible>
          {this.fill()}
          <DialogButtonCancel onPress={this.props.onCancel.bind(this)} />
          <DialogButtonOk disabled={disabled} label={okLabel ? okLabel : "Valider"} onPress={this.onPress.bind(this)} />
        </DialogContainer>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  textInput: {},
});
