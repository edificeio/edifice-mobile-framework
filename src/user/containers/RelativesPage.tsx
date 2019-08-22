import { connect } from "react-redux";
import { RelativesPage } from "../components/RelativesPage";

export default connect(
    (state: any) => ({
        relatives: state.user.info.parents
    })
)(RelativesPage);
