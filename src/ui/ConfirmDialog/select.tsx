import React from "react";
import TreeSelect from "./treeSelect";
import { IId } from "../../types/iid";
import { ITreeItem } from "../../workspace/actions/helpers/formatListFolders";

type IProps = {
  defaultSelectedId?: string[];
  excludeData: IId[];
  onPress: (event) => void;
  data: ITreeItem[];
};

export default class Select extends React.PureComponent<IProps> {
  static displayName = "DialogSelect";
  state = {
    defaultSelectedId: this.props.defaultSelectedId ? this.props.defaultSelectedId : ["owner"],
  };

  onPress(id) {
    this.setState({
      defaultSelectedId: [id],
    });
    this.props.onPress(id);
  }

  render() {
    const { data, excludeData, onPress } = this.props;

    return (
      <TreeSelect
        data={data}
        defaultSelectedId={this.state.defaultSelectedId}
        excludeData={excludeData}
        openIds={["owner"]}
        onClick={onPress}
      />
    );
  }
}
