import React from "react";
import { View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import TreeSelect from "./treeSelect";
import { layoutSize } from "../../styles/common/layoutSize";
import { ITreeItem } from "../../workspace/actions/helpers/formatListFolders";
import { IId } from "../../types";
import { CommonStyles } from "../../styles/common/styles";

type IProps = {
  onPress: (event) => void;
  data: ITreeItem[];
  excludeData: IId[];
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
    const { data, excludeData, onPress } = this.props;

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
          excludeData={excludeData}
          openIds={["owner"]}
          onClick={onPress}
          treeNodeStyle={{
            openIcon: <Icon size={layoutSize.LAYOUT_24} color={CommonStyles.orangeColorTheme} name="menu-down" />,
            closeIcon: <Icon size={layoutSize.LAYOUT_24} color={CommonStyles.orangeColorTheme} name="menu-right" />,
          }}
        />
      </View>
    );
  }
}
