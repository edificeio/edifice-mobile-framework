import I18n from 'i18n-js';
import * as React from 'react';
import { View } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { fetchMementoAction } from '../actions/memento';
import { RelativesInfos, StudentInfos } from '../components/Memento';
import { getMementoState, IMementoState } from '../state/memento';

import { standardNavScreenOptions } from '~/navigation/helpers/navScreenOptions';
import { PageContainer } from '~/ui/ContainerContent';
import { HeaderBackAction } from '~/ui/headers/NewHeader';

export type IMementoContainerProps = {
  navigation: NavigationScreenProp<any>;
  memento: IMementoState;
  fetchMemento: (studentId: string) => void;
};

class Memento extends React.PureComponent<IMementoContainerProps> {
  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<object> }) => {
    return standardNavScreenOptions(
      {
        title: I18n.t('viesco-memento'),
        headerLeft: <HeaderBackAction navigation={navigation} />,
        headerRight: <View />,
        headerStyle: {
          backgroundColor: '#FCB602',
        },
      },
      navigation,
    );
  };

  componentDidMount() {
    this.props.fetchMemento(this.props.navigation.state.params.studentId);
  }

  render() {
    const { memento } = this.props;

    return (
      <PageContainer>
        <StudentInfos memento={memento?.data} />
        {memento.data && memento.data.relatives && <RelativesInfos relatives={memento.data?.relatives} />}
      </PageContainer>
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
