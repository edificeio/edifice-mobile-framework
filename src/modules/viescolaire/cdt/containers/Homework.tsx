import I18n from 'i18n-js';
import * as React from 'react';
import { View } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import DisplayHomework from '~/modules/viescolaire/cdt/components/DisplayHomework';
import DisplayListHomework from '~/modules/viescolaire/cdt/components/DisplayListHomework';
import { standardNavScreenOptions } from '~/navigation/helpers/navScreenOptions';
import { HeaderBackAction } from '~/ui/headers/NewHeader';

class Homework extends React.PureComponent<any> {
  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<object> }) => {
    const diaryTitle = navigation.getParam('diaryTitle');

    return standardNavScreenOptions(
      {
        title: diaryTitle || I18n.t('Homework'),
        headerLeft: <HeaderBackAction navigation={navigation} />,
        headerRight: <View />,
        headerStyle: {
          backgroundColor: '#2BAB6F',
        },
      },
      navigation,
    );
  };

  public render() {
    if (this.props.navigation.state.params.homework === undefined) {
      return (
        <DisplayListHomework
          {...this.props}
          subject={this.props.navigation.state.params.subject}
          homeworkList={this.props.navigation.state.params.homeworkList}
        />
      );
    }
    return (
      <DisplayHomework
        {...this.props}
        homework={this.props.navigation.state.params.homework}
        homeworkList={this.props.navigation.state.params.homeworkList}
      />
    );
  }
}

const mapStateToProps: (state: any) => any = state => {
  return {};
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators({}, dispatch);
};

export default connect(mapStateToProps)(Homework);
