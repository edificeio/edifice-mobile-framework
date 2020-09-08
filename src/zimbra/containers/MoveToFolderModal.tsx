import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { moveMailsToFolderAction, moveMailsToInboxAction } from "../actions/mail";
import MoveToFolderModalComponent from "../components/MoveToFolderModal";
import { getFolderListState } from "../state/folders";

type MoveToFolderModalProps = {
  folders: any;
  show: boolean;
  mail: any;
  closeModal: () => any;
  moveToFolder: (ids: string[], folder: string) => any;
  moveToInbox: (ids: string[]) => any;
  successCallback: () => any;
};

type MoveToFolderModalState = {
  selectedFolder: string | null;
};

class MoveToFolderModal extends React.Component<MoveToFolderModalProps, MoveToFolderModalState> {
  constructor(props) {
    super(props);
    this.state = {
      selectedFolder: null,
    };
  }

  selectFolder = (selectedFolder: string) => {
    this.setState({
      selectedFolder,
    });
  };

  confirm = async () => {
    const { moveToFolder, moveToInbox, mail, successCallback } = this.props;
    const { selectedFolder } = this.state;
    this.props.closeModal();
    if (!selectedFolder) return;
    else if (selectedFolder === "inbox") await moveToInbox([mail.id]);
    else await moveToFolder([mail.id], selectedFolder);
    successCallback();
  };

  public render() {
    return (
      <MoveToFolderModalComponent
        {...this.props}
        selectedFolder={this.state.selectedFolder}
        selectFolder={this.selectFolder}
        confirm={this.confirm}
      />
    );
  }
}

const mapStateToProps = (state: any) => {
  return {
    folders: getFolderListState(state),
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(
    {
      moveToFolder: moveMailsToFolderAction,
      moveToInbox: moveMailsToInboxAction,
    },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(MoveToFolderModal);
