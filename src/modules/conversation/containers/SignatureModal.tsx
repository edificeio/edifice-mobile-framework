import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { putSignatureAction } from "../actions/signature";
import SignatureModalComponent from "../components/SignatureModal";
import { getSignatureState } from "../state/signature";

type SignatureModalProps = {
  signature: string;
  show: boolean;
  closeModal: () => any;
  putSignature: (signatureData: string, isGlobalSignature: boolean) => any;
  successCallback: () => any;
};

type MoveToFolderModalState = {
  signature: string;
  isGlobalSignature: boolean;
};

class SignatureModal extends React.Component<SignatureModalProps, MoveToFolderModalState> {
  constructor(props) {
    super(props);

    const { signature } = this.props;
    this.state = {
      signature: signature,
      isGlobalSignature: false,
    };
  }

  setSignature = (text: string) => {
    this.setState({ signature: text });
  };

  setGlobalSignature = (isGlobal: boolean) => {
    this.setState({ isGlobalSignature: isGlobal });
  };

  toggleGlobal = () => {
    const { isGlobalSignature } = this.state;
    this.setState({ isGlobalSignature: !isGlobalSignature });
  };

  confirm = () => {
    const { putSignature, successCallback } = this.props;
    const { signature, isGlobalSignature } = this.state;
    this.props.closeModal();

    if (!signature) return;
    else putSignature(signature, isGlobalSignature);
    successCallback();
  };

  public render() {
    return (
      <SignatureModalComponent
        {...this.props}
        signature={this.state.signature}
        isGlobalSignature={this.state.isGlobalSignature}
        setSignature={this.setSignature}
        setGlobalSignature={this.setGlobalSignature}
        toggleGlobal={this.toggleGlobal}
        confirm={this.confirm}
      />
    );
  }
}

const mapStateToProps = (state: any) => {
  const { data, isFetching } = getSignatureState(state);
  return {
    signatureMail: data.preference,
    isFetching,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(
    {
      putSignature: putSignatureAction,
    },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(SignatureModal);
