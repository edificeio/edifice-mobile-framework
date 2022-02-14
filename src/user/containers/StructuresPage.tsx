import { connect } from 'react-redux';

import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { StructuresPage } from '~/user/components/StructuresPage';

const StructuresPageConnected = connect((state: any) => ({
  schools: state.user.info.schools,
}))(StructuresPage);

const StructuresPageOk = withViewTracking('user/structures')(StructuresPageConnected);

export default StructuresPageOk;
