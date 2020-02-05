import React from "react";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import TreeSelect from "./treeSelect";
import { View } from "react-native";
import { layoutSize } from "../../styles/common/layoutSize";
import { ITreeItem } from "../../workspace/actions/helpers/formatListFolders";

type IProps = {
  onPress: (event) => void;
  data: ITreeItem[];
};

export default class Select extends React.PureComponent<IProps> {
  static displayName = "DialogSelect";
  state = {
    defaultSelectedId: ["owner"],
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
          openIds={["owner"]}
          onClick={onPress}
          onClickLeaf={onPress}
          treeNodeStyle={{
            openIcon: <Icon size={layoutSize.LAYOUT_24} color="#FF8800" name="menu-down" />,
            closeIcon: <Icon size={layoutSize.LAYOUT_24} color="#FF8800" name="menu-right" />,
          }}
        />
      </View>
    );
  }
}
