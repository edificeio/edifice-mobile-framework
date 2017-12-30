import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { AppScreen, AppScreenProps } from "../components/AppScreen"
import {checkLogin} from "../actions/auth";

const mapStateToProps = () => ({
})

const dispatchAndMapActions = dispatch => bindActionCreators({checkLogin}, dispatch)

export default connect<{}, {}, AppScreenProps>(mapStateToProps, dispatchAndMapActions)(AppScreen)
