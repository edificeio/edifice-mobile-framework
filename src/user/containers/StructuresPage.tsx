import { connect } from "react-redux";
import { StructuresPage } from "../components/StructuresPage";
import withViewTracking from "../../infra/tracker/withViewTracking";

const StructuresPageConnected = connect(
    (state: any) => ({
        schools: state.user.info.schools
    })
)(StructuresPage);

const StructuresPageOk = withViewTracking("user/structures")(StructuresPageConnected);

export default StructuresPageOk;
