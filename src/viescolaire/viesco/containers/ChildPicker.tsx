import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { selectChildAction } from "../actions/children";
import ChildPicker from "../components/ChildPicker";
import { getChildrenList, getSelectedChild } from "../state/children";

const mapStateToProps: (state: any) => any = state => {
  return {
    children: getChildrenList(state),
    selectedChild: getSelectedChild(state),
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators({ selectChild: selectChildAction }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(ChildPicker);
