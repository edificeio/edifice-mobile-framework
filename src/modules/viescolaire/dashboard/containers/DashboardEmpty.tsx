import I18n from 'i18n-js';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { EmptyScreen } from '~/framework/components/emptyScreen';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { PageContainer } from '~/ui/ContainerContent';

class Dashboard extends React.PureComponent<any> {
  public render() {
    return (
      <PageContainer>
        <EmptyScreen
          svgImage="empty-viesco"
          title={I18n.t('viesco-empty-screen-title')}
          text={I18n.t('viesco-empty-screen-text')}
        />
      </PageContainer>
    );
  }
}

const mapStateToProps: (state: any) => any = state => {
  return {};
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators({}, dispatch);
};

export default withViewTracking('viesco')(connect(mapStateToProps, mapDispatchToProps)(Dashboard));
