import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { putSignatureAction } from '~/modules/zimbra/actions/signature';
import SignatureModalComponent from '~/modules/zimbra/components/Modals/SignatureModal';
import { ISignature, getSignatureState } from '~/modules/zimbra/state/signature';

type SignatureModalProps = {
  show: boolean;
  signature: string;
  signatureData: ISignature;
  closeModal: () => any;
  putSignature: (signatureData: string, isGlobalSignature: boolean) => any;
  successCallback: () => any;
};

type MoveToFolderModalState = {
  isGlobalSignature: boolean;
  isUpdated: boolean;
  signature: string;
};

class SignatureModal extends React.Component<SignatureModalProps, MoveToFolderModalState> {
  constructor(props) {
    super(props);

    const { preference } = this.props.signatureData;
    let signatureCheck = false;
    if (preference !== undefined) {
      if (typeof preference === 'object') signatureCheck = preference.useSignature;
      else signatureCheck = JSON.parse(preference).useSignature;
    }

    this.state = {
      signature: this.props.signature,
      isGlobalSignature: signatureCheck,
      isUpdated: false,
    };
  }

  componentDidUpdate = () => {
    if (!this.state.isUpdated && this.props.signature !== this.state.signature)
      this.setState({ isUpdated: true, signature: this.props.signature });
  };

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

  confirm = async () => {
    const { putSignature, successCallback } = this.props;
    const { signature, isGlobalSignature } = this.state;
    this.props.closeModal();

    await putSignature(signature, isGlobalSignature);
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
    dispatch,
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(SignatureModal);
