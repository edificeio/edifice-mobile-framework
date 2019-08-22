import { connect } from "react-redux";
import { StructuresPage } from "../components/StructuresPage";

export default connect(
    (state: any) => ({
        schools: state.user.info.schools
    })
)(StructuresPage);
