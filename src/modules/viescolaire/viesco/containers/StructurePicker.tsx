import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { selectStructureAction } from "../actions/structure";
import StructurePicker from "../components/StructurePicker";
import { getStructuresList, getSelectedStructure } from "../state/structure";

const mapStateToProps: (state: any) => any = state => {
  return {
    structures: getStructuresList(state),
    selectedStructure: getSelectedStructure(state),
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators({ selectStructure: selectStructureAction }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(StructurePicker);
