import React from "react";
import TreeSelect from "react-native-tree-select";
import { View } from "react-native";
import { Icon } from "../index";
import { layoutSize } from "../../styles/common/layoutSize";
import { ITreeItem } from "../../workspace/actions/helpers/formatListFolders";

type IProps = {
  onPress: (event) => void;
  data: ITreeItem[];
};

export default class Select extends React.PureComponent<IProps> {
  static displayName = "DialogSelect";
  state = {
    defaultSelectedId: [],
  };

  onPress({ item }) {
    this.setState({
      defaultSelectedId: [item.id],
    });
    this.props.onPress({ item });
  }

  render() {
    const { data, onPress } = this.props;

    return (
      <View
        style={{
          maxHeight: layoutSize.LAYOUT_450,
          height: layoutSize.LAYOUT_60 * 6,
          marginTop: layoutSize.LAYOUT_10,
          marginBottom: layoutSize.LAYOUT_10,
          position: "relative",
          display: "flex",
          flex: 0,
        }}>
        <TreeSelect
          data={data}
          defaultSelectedId={this.state.defaultSelectedId}
          // isOpen
          // openIds={['A01']}
          isShowTreeId={false}
          itemStyle={{
            // backgroudColor: '#8bb0ee',
            fontSize: layoutSize.LAYOUT_14,
            color: "#995962",
          }}
          openIds={["owner"]}
          selectedItemStyle={{
            backgroundColor: "#f7edca",
            fontSize: layoutSize.LAYOUT_14,
            color: "#171e99",
          }}
          onClick={onPress}
          onClickLeaf={onPress}
          treeNodeStyle={{
            openIcon: <Icon size={16} color="#171e99" style={{ marginRight: 10 }} name="arrow_down" />,
            closeIcon: <Icon size={18} color="#171e99" style={{ marginRight: 10 }} name="chevron-left1" />,
          }}
        />
      </View>
    );
  }
}
