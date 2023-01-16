import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { Asset } from 'react-native-image-picker';
import Toast from 'react-native-tiny-toast';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { UI_ANIMATIONS } from '~/framework/components/constants';
import { DocumentPicked, ImagePicked } from '~/framework/components/menus/actions';
import { PageView } from '~/framework/components/page';
import { DocumentPicked, ImagePicked } from '~/framework/components/popup-menu';
import { LocalFile } from '~/framework/util/fileHandler';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import pickFile, { pickFileError } from '~/infra/actions/pickFile';
import { getSelectedChild } from '~/modules/viescolaire/dashboard/state/children';
import { viescoTheme } from '~/modules/viescolaire/dashboard/utils/viescoTheme';
import { declareAbsenceAction, declareAbsenceWithFileAction } from '~/modules/viescolaire/presences/actions/declaration';
import DeclarationComponent from '~/modules/viescolaire/presences/components/Declaration';

type DeclarationProps = {
  declareAbsenceAction: (startDate: moment.Moment, endDate: moment.Moment, comment: string) => void;
  declareAbsenceWithFileAction: (startDate: moment.Moment, endDate: moment.Moment, comment: string, file: LocalFile) => void;
  onPickFileError: (notifierId: string) => void;
  childName: string;
} & NavigationInjectedProps;

type DeclarationState = {
  startDate: moment.Moment;
  endDate: moment.Moment;
  comment: string;
  tempAttachment?: any;
  attachment?: LocalFile | null;
};

class Declaration extends React.PureComponent<DeclarationProps, DeclarationState> {
  constructor(props) {
    super(props);
    this.props.navigation.setParams({ childName: this.props.childName });
    this.state = {
      startDate: moment().startOf('day').hour(7),
      endDate: moment().startOf('day').hour(18),
      comment: '',
    };
  }

  updateStartDate = date => {
    this.setState({ startDate: date });
  };

  updateEndDate = date => {
    this.setState({ endDate: date });
  };

  updateComment = (comment: string) => {
    this.setState({
      comment,
    });
  };

  pickAttachment = () => {
    pickFile()
      .then(contentUri => {
        this.setState({ attachment: contentUri });
      })
      .catch(err => {
        if (err.message === 'Error picking image' || err.message === 'Error picking document') {
          this.props.onPickFileError('viesco');
        }
      });
  };

  onPickAttachment = (att: ImagePicked | DocumentPicked) => {
    this.setState({
      attachment: new LocalFile(att as Asset | DocumentPicked, { _needIOSReleaseSecureAccess: false }),
    });
  };

  submitForm = async () => {
    const { startDate, endDate, comment, attachment } = this.state;

    if (attachment) {
      await this.props.declareAbsenceWithFileAction(startDate, endDate, comment, attachment);
    } else await this.props.declareAbsenceAction(startDate, endDate, comment);
    this.props.navigation.goBack();
    Toast.showSuccess(I18n.t('viesco-absence-declared'), { ...UI_ANIMATIONS.toast });
  };

  validate = () => {
    const startBeforeEnd = this.state.startDate.isBefore(this.state.endDate);
    const startDayNotBeforeToday = this.state.startDate.isSameOrAfter(moment(), 'day');
    return startBeforeEnd && startDayNotBeforeToday;
  };

  public render() {
    return (
      <PageView
        navigation={this.props.navigation}
        navBarWithBack={{
          title: `${I18n.t('viesco-absence-declaration')} ${this.props.navigation.getParam('childName')}`,
          style: {
            backgroundColor: viescoTheme.palette.presences,
          },
        }}>
        <DeclarationComponent
          {...this.props}
          {...this.state}
          validate={this.validate}
          updateEndDate={this.updateEndDate}
          updateStartDate={this.updateStartDate}
          updateComment={this.updateComment}
          pickAttachment={this.pickAttachment}
          onPickAttachment={this.onPickAttachment}
          removeAttachment={() => this.setState({ attachment: null })}
          submit={this.submitForm}
        />
      </PageView>
    );
  }
}

const mapStateToProps = (state: any) => {
  const child = getSelectedChild(state);

  return {
    childName: child.lastName + ' ' + child.firstName,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(
    {
      declareAbsenceAction,
      declareAbsenceWithFileAction,
      onPickFileError: (notifierId: string) => dispatch(pickFileError(notifierId)),
    },
    dispatch,
  );
};

export default withViewTracking('viesco/absence')(connect(mapStateToProps, mapDispatchToProps)(Declaration));
