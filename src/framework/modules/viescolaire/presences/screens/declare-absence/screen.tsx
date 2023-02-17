import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { Asset } from 'react-native-image-picker';
import Toast from 'react-native-tiny-toast';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import { UI_ANIMATIONS } from '~/framework/components/constants';
import { DocumentPicked, ImagePicked } from '~/framework/components/menus/actions';
import { PageView } from '~/framework/components/page';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';
import { getSelectedChild } from '~/framework/modules/viescolaire/dashboard/state/children';
import DeclarationComponent from '~/framework/modules/viescolaire/presences/components/Declaration';
import { PresencesNavigationParams, presencesRouteNames } from '~/framework/modules/viescolaire/presences/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';
import { LocalFile } from '~/framework/util/fileHandler';
import { tryAction } from '~/framework/util/redux/actions';
import pickFile from '~/infra/actions/pickFile';
import { declareAbsenceAction, declareAbsenceWithFileAction } from '~/modules/viescolaire/presences/actions/declaration';

import { PresencesDeclareAbsenceScreenPrivateProps } from './types';

type PresencesDeclareAbsenceScreenState = {
  startDate: moment.Moment;
  endDate: moment.Moment;
  comment: string;
  tempAttachment?: any;
  attachment?: LocalFile | null;
};

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<PresencesNavigationParams, typeof presencesRouteNames.declareAbsence>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
  }),
  title: `${I18n.t('viesco-absence-declaration')} ${route.params.childName}`,
  headerStyle: {
    backgroundColor: viescoTheme.palette.presences,
  },
});

class PresencesDeclareAbsenceScreen extends React.PureComponent<
  PresencesDeclareAbsenceScreenPrivateProps,
  PresencesDeclareAbsenceScreenState
> {
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
      <PageView>
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

export default connect(
  (state: IGlobalState) => {
    const child = getSelectedChild(state);

    return {
      childName: child.lastName + ' ' + child.firstName,
    };
  },
  (dispatch: ThunkDispatch<any, any, any>) =>
    bindActionCreators(
      {
        declareAbsenceAction: tryAction(declareAbsenceAction, undefined, true),
        declareAbsenceWithFileAction: tryAction(declareAbsenceWithFileAction, undefined, true),
      },
      dispatch,
    ),
)(PresencesDeclareAbsenceScreen);
