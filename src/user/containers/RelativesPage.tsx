import { connect } from "react-redux";
import { RelativesPage } from "../components/RelativesPage";
import withViewTracking from "../../infra/tracker/withViewTracking";

const RelativesPageConnected = connect(
    (state: any) => ({
        relatives: state.user.info.parents
    })
)(RelativesPage);

export default withViewTracking("user/relatives")(RelativesPageConnected);

