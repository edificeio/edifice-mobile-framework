import I18n from 'i18n-js';
import * as React from 'react';
import Toast from 'react-native-tiny-toast';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { IUserSession } from '~/framework/util/session';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import pickFile from '~/infra/actions/pickFile';
import { createTicketAction, addAttachmentAction, deleteAttachmentAction } from '~/modules/support/actions/support';
import Support from '~/modules/support/components/Support';
import { PageView } from '~/framework/components/page';

export type INewAttachment = {
  contentType?: string;
  name?: string;
  id?: string;
  size?: number;
};

export type ITicket = {
  category: string;
  school_id: string;
  subject: string;
  description: string;
  attachments?: any[];
};

export type IEstablishment = {
  id: string;
  name: string;
};

export type IApp = {
  name: string;
  address: string;
  icon: string;
  target: any;
  displayName: string;
  display: boolean;
  prefix: string;
};

type ISupportProps = {
  categoryList: IApp[];
  establishmentsList: IEstablishment[];
  session: IUserSession;
  createTicket: (ticket: ITicket) => any;
  addAttachment: (attachment: object, session: IUserSession) => INewAttachment;
  deleteAttachment: (attachmentId: string) => void;
} & NavigationInjectedProps;

type ISupportState = {
  ticket: ITicket;
  tempAttachment?: any;
};

class SupportContainer extends React.PureComponent<ISupportProps, ISupportState> {
  constructor(props) {
    super(props);
    this.state = {
      ticket: {
        category: '',
        school_id: '',
        subject: '',
        description: '',
        attachments: [],
      },
      tempAttachment: null,
    };
  }

  removeAttachment = (attachmentId: string) => {
    this.props.deleteAttachment(attachmentId);
    const attachmentRemoved = this.state.ticket.attachments.find(key => key.id === attachmentId);
    const attachmentList = [...this.state.ticket.attachments];
    const index = attachmentList.indexOf(attachmentRemoved);
    if (index !== -1) {
      attachmentList.splice(index, 1);
      this.setState(prevState => ({ ticket: { ...prevState.ticket, attachments: attachmentList } }));
    }
  };

  uploadAttachment = async () => {
    const file = await pickFile();
    const fileState = {
      contentType: file.filetype,
      filename: file.filename,
    };
    this.setState({ tempAttachment: fileState });
    try {
      const newAttachment: INewAttachment = await this.props.addAttachment(file, this.props.session);
      const joinedAttachments = this.state.ticket.attachments.concat(newAttachment);
      this.setState(prevState => ({
        ticket: { ...prevState.ticket, attachments: joinedAttachments },
        tempAttachment: null,
      }));
    } catch (e) {
      Toast.show(I18n.t('support-attachment-error'), {
        position: Toast.position.BOTTOM,
        mask: false,
        containerStyle: { width: '95%', backgroundColor: 'black' },
      });
      this.setState({ tempAttachment: fileState });
    }
  };

  checkTicket = () => {
    const { ticket } = this.state;
    let result;
    if (!ticket.subject) {
      result = 'support-ticket-error-form-subject-empty';
    } else if (ticket.subject.length > 255) {
      result = 'support-ticket-error-form-subject-size';
    } else if (!ticket.description) {
      result = 'support-ticket-error-form-description-empty';
    } else {
      result = false;
    }
    return result;
  };

  sendTicket = async (reset: (() => void)[]) => {
    const error = this.checkTicket();
    if (error) {
      Toast.show(I18n.t(error), {
        position: Toast.position.BOTTOM,
        mask: false,
        containerStyle: { width: '95%', backgroundColor: 'black' },
      });
    } else {
      try {
        const response = await this.props.createTicket(this.state.ticket);

        Toast.showSuccess(I18n.t('support-ticket-success-id') + response.id + I18n.t('support-ticket-success-info'), {
          position: Toast.position.BOTTOM,
          duration: 5000,
          mask: false,
          containerStyle: { width: '95%', backgroundColor: 'black' },
        });
        this.setState(prevState => ({
          ticket: { ...prevState.ticket, subject: '', description: '', attachments: [] },
          tempAttachment: null,
        }));
        reset.forEach(reset => reset());
      } catch (e) {
        Toast.show(I18n.t('support-ticket-failure'), {
          position: Toast.position.BOTTOM,
          mask: false,
          containerStyle: { width: '95%', backgroundColor: 'black' },
        });
      }
    }
  };

  public render() {
    return (
      <PageView
        navigation={this.props.navigation}
        navBarWithBack={{
          title: I18n.t('support'),
        }}>
        <Support
          {...this.props}
          ticket={this.state.ticket}
          attachments={
            this.state.tempAttachment
              ? [...this.state.ticket.attachments, this.state.tempAttachment]
              : this.state.ticket.attachments
          }
          onFieldChange={field => this.setState(prevState => ({ ticket: { ...prevState.ticket, ...field } }))}
          uploadAttachment={this.uploadAttachment}
          removeAttachment={this.removeAttachment}
          sendTicket={this.sendTicket}
        />
      </PageView>
    );
  }
}

// ------------------------------------------------------------------------------------------------

const mapStateToProps: (state: any) => any = state => {
  const categoryOther: any = { address: 'modules-names.other' };
  categoryOther.name = I18n.t(categoryOther.address);

  const categoryList = [] as any[];
  for (const app of state.user.info.appsInfo) {
    if (app.address && app.name && app.address.length > 0 && app.name.length > 0) {
      const translation = I18n.t('modules-names.' + app.displayName.toLowerCase());
      if (translation.substring(0, 9) !== '[missing ') {
        categoryList.push({...app, name: translation});
      } else if (/^[A-Z]/.test(app.displayName)) {
        categoryList.push({...app, name: app.displayName});
      }
    }
  }

  categoryList.push(categoryOther);
  categoryList.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

  const establishmentList = state.user.info.schools.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
  const authorizedActions = state.user.info.authorizedActions;
  const hasRightToCreateTicket =
    authorizedActions && authorizedActions.some(action => action.displayName === 'support.ticket.create');

  return {
    categoryList,
    establishmentList,
    hasRightToCreateTicket,
  };
};

// ------------------------------------------------------------------------------------------------

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators(
    {
      createTicket: createTicketAction,
      addAttachment: addAttachmentAction,
      deleteAttachment: deleteAttachmentAction,
    },
    dispatch,
  );
};

// ------------------------------------------------------------------------------------------------

export default withViewTracking('support/Support')(connect(mapStateToProps, mapDispatchToProps)(SupportContainer));
