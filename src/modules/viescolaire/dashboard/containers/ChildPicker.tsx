import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { selectChildAction } from '~/modules/viescolaire/dashboard/actions/children';
import { ChildPicker } from '~/modules/viescolaire/dashboard/components/ChildPicker';
import { getChildrenList, getSelectedChild } from '~/modules/viescolaire/dashboard/state/children';

const mapStateToProps: (state: any) => any = state => {
  return {
    childrenArray: getChildrenList(state),
    selectedChildId: getSelectedChild(state).id,
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators({ selectChild: selectChildAction }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(ChildPicker);
