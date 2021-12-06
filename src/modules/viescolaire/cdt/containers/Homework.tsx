import I18n from 'i18n-js';
import * as React from 'react';
import { View } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { fetchJSONWithCache } from '~/infra/fetchWithCache';
import DisplayHomework from '~/modules/viescolaire/cdt/components/DisplayHomework';
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
      },
      navigation,
    );
  };

  public render() {
    return <DisplayHomework {...this.props} />;
  }
}

const mapStateToProps: (state: any) => any = state => {
  return {
    getfunction: fetchJSONWithCache(`/diary/homework/49`),
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators({}, dispatch);
};

export default connect(mapStateToProps)(Homework);
