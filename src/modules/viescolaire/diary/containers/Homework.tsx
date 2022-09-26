import I18n from 'i18n-js';
import * as React from 'react';
import { connect } from 'react-redux';

import { PageView } from '~/framework/components/page';
import { viescoTheme } from '~/modules/viescolaire/dashboard/utils/viescoTheme';
import DisplayHomework from '~/modules/viescolaire/diary/components/DisplayHomework';
import DisplayListHomework from '~/modules/viescolaire/diary/components/DisplayListHomework';

class Homework extends React.PureComponent<any> {
  public render() {
    const diaryTitle = this.props.navigation.getParam('diaryTitle');
    const content =
      this.props.navigation.state.params.homework === undefined ? (
        // Displayed when user is a teacher
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
          style: { backgroundColor: viescoTheme.palette.diary },
        }}>
        {content}
      </PageView>
    );
  }
}

const mapStateToProps: (state: any) => any = state => {
  return {};
};

export default connect(mapStateToProps)(Homework);
