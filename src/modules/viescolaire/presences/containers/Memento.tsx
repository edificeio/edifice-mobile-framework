import I18n from 'i18n-js';
import * as React from 'react';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { PageView } from '~/framework/components/page';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';
import { fetchMementoAction } from '~/modules/viescolaire/presences/actions/memento';
import { RelativesInfos, StudentInfos } from '~/modules/viescolaire/presences/components/Memento';
import { IMementoState, getMementoState } from '~/modules/viescolaire/presences/state/memento';

export type IMementoContainerProps = {
  memento: IMementoState;
  fetchMemento: (studentId: string) => void;
} & NavigationInjectedProps<any>;

class Memento extends React.PureComponent<IMementoContainerProps> {
  componentDidMount() {
    this.props.fetchMemento(this.props.navigation.state.params.studentId);
  }

  render() {
    const { memento } = this.props;

    return (
      <PageView
        navigation={this.props.navigation}
        navBarWithBack={{
          title: I18n.t('viesco-memento'),
          style: {
            backgroundColor: viescoTheme.palette.presences,
          },
        }}>
        <StudentInfos memento={memento?.data} />
        {memento.data && memento.data.relatives && <RelativesInfos relatives={memento.data?.relatives} />}
      </PageView>
    );
  }
}

const mapStateToProps: (state: any) => any = state => {
  return {
    memento: getMementoState(state),
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators(
    {
      fetchMemento: fetchMementoAction,
    },
    dispatch,
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Memento);
