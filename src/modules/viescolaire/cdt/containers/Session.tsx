import I18n from 'i18n-js';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { PageView } from '~/framework/components/page';
import DisplaySession from '~/modules/viescolaire/cdt/components/DisplaySession';

class Session extends React.PureComponent<any> {
  public render() {
    return (
      <PageView
        navigation={this.props.navigation}
        navBarWithBack={{
          title: I18n.t('Homework'),
          style: {
            backgroundColor: '#2BAB6F',
          },
        }}>
        <DisplaySession
          {...this.props}
          session={this.props.navigation.state.params.session}
          sessionList={this.props.navigation.state.params.sessionList}
        />
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

export default connect(mapStateToProps)(Session);
