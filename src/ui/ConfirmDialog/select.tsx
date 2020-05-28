import React from "react";
import TreeSelect from "./treeSelect";
import { ITreeItem } from "../../workspace/actions/helpers/formatListFolders";
import { IFile } from "../../workspace/types/states/items";

type IProps = {
  defaultSelectedId?: string[];
  excludeData: IFile[];
  onPress: (id: string, isParentOfSelection: boolean) => void;
  data: ITreeItem[];
};

export default class Select extends React.PureComponent<IProps> {
  static displayName = "DialogSelect";
  state = {
    defaultSelectedId: this.props.defaultSelectedId ? this.props.defaultSelectedId : ["owner"],
  };

  onPress(id, isParentOfSelection) {
    this.setState({
      defaultSelectedId: [id],
    });
    this.props.onPress(id, isParentOfSelection);
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
