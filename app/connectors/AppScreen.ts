import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { checkLogin } from "../actions/auth"
import { AppScreen, AppScreenProps } from "../components/AppScreen"

const mapStateToProps = () => ({})

const dispatchAndMapActions = dispatch => bindActionCreators({ checkLogin }, dispatch)

export default connect<{}, {}, AppScreenProps>(mapStateToProps, dispatchAndMapActions)(AppScreen)
