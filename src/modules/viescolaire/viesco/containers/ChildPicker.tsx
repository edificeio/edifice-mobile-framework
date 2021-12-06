import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { selectChildAction } from '~/modules/viescolaire/viesco/actions/children';
import ChildPicker from '~/modules/viescolaire/viesco/components/ChildPicker';
import { getChildrenList, getSelectedChild } from '~/modules/viescolaire/viesco/state/children';

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
