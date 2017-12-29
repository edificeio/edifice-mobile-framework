import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { login } from "../actions/auth"
import { initNavigationState } from "../actions/navigation"
import { App, AppProps } from "../components/App"

const mapStateToProps = (state) => ({
	auth: state.auth,
	navigation: state.navigation,
})

const dispatchAndMapActions = dispatch => bindActionCreators({ initNavigationState, login }, dispatch)

export default connect<{}, {}, AppProps>(mapStateToProps, dispatchAndMapActions)(App)
