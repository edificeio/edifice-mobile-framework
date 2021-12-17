import { connect } from 'react-redux';

import { ChildrenPage } from '~/user/components/ChildrenPage';

export default connect((state: any) => ({
  schools: state.user.info.childrenStructure,
}))(ChildrenPage);
