import I18n from 'i18n-js';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { PageView } from '~/framework/components/page';

import DisplayHomework from '~/modules/viescolaire/cdt/components/DisplayHomework';
import DisplayListHomework from '~/modules/viescolaire/cdt/components/DisplayListHomework';

class Homework extends React.PureComponent<any> {
  public render() {
    const diaryTitle = this.props.navigation.getParam('diaryTitle');
    const content =
      this.props.navigation.state.params.homework === undefined ? (
        <DisplayListHomework
          {...this.props}
          subject={this.props.navigation.state.params.subject}
          homeworkList={this.props.navigation.state.params.homeworkList}
        />
      ) : (
        <DisplayHomework
          {...this.props}
          homework={this.props.navigation.state.params.homework}
          homeworkList={this.props.navigation.state.params.homeworkList}
        />
      );
    return (
      <PageView
        navigation={this.props.navigation}
        navBarWithBack={{
          title: diaryTitle || I18n.t('Homework'),
          style: { backgroundColor: '#2BAB6F' },
        }}>
        {content}
      </PageView>
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
