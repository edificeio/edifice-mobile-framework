import * as React from "react";
import { FlatList, View } from "react-native";
import Dialog from "react-native-dialog";
import { IFile, IItem } from "../../workspace/types/states/items";
import { Item } from "../../workspace/components";
import { layoutSize } from "../../styles/common/layoutSize";

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
  value: any;
};

export class ConfigDialog extends React.Component<IProps, IState> {
  state = {
    value: null,
  };

  onPress() {
    // call getValue() to get the values of the form
    const { onValid, selected } = this.props;
    const { value } = this.state;

    if (value) {
      onValid({ value });
    } else {
      onValid({});
    }
  }

  getValue() {
    if (this.state.value) {
      return this.state.value;
    }

    const { input, selected } = this.props;

    return selected.length ? selected[0][input] || "" : "";
  }

  fill() {
    const { input, selected, title } = this.props;

    if (input) {
      return (
        <>
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Input
            value={this.getValue()}
            wrapperStyle={{ borderBottom: "1px solid green" }}
            onChangeText={(value: string) => this.setState({ value })}
          />
        </>
      );
    } else {
      return (
        <>
          <Dialog.Title>{title}</Dialog.Title>
          {selected && (
            <View
              style={{
                height: layoutSize.LAYOUT_200,
                maxHeight: layoutSize.LAYOUT_375,
                marginTop: layoutSize.LAYOUT_10,
                marginBottom: layoutSize.LAYOUT_10,
              }}
            >
              <FlatList
                ItemSeparatorComponent={() => <View style={{ backgroundColor: "#ffffff", width: "100%", height: 0 }} />}
                data={selected}
                keyExtractor={(item: IItem) => item.id}
                renderItem={({ item }) => <Item item={item} simple={true} />}
              />
            </View>
          )}
        </>
      );
    }
  }

  render() {
    const { okLabel } = this.props;

    return (
      <View>
        <Dialog.Container visible={true}>
          {this.fill()}
          <Dialog.Button label="Annuler" onPress={this.props.onCancel.bind(this)} />
          <Dialog.Button label={okLabel ? okLabel : "Valider"} onPress={this.onPress.bind(this)} />
        </Dialog.Container>
      </View>
    );
  }
}
