import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { selectStructureAction } from '~/modules/viescolaire/dashboard/actions/structure';
import StructurePicker from '~/modules/viescolaire/dashboard/components/StructurePicker';
import { getSelectedStructure, getStructuresList } from '~/modules/viescolaire/dashboard/state/structure';

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
