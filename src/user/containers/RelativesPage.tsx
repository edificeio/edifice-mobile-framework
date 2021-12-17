import { connect } from 'react-redux';

import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { RelativesPage } from '~/user/components/RelativesPage';

const RelativesPageConnected = connect((state: any) => ({
  relatives: state.user.info.parents,
}))(RelativesPage);

export default withViewTracking('user/relatives')(RelativesPageConnected);
