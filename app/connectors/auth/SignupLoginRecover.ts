import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { login, recoverPassword } from "../../actions/auth"
import { ISignupLoginRecoverProps, SignupLoginRecover } from "../../auth/SignupLoginRecover"

export const initialStateWithEmail = email => ({
	email,
	password: "",
	loggedIn: false,
	synced: true,
})

const mapStateToProps = (state, props) => ({
	auth:
		props.navigation.state.routeName === "Login" && props.navigation.state.params && props.navigation.state.params.email
			? initialStateWithEmail(props.navigation.state.params.email)
			: state.auth,
})

const dispatchAndMapActions = dispatch => bindActionCreators({ login, recoverPassword }, dispatch)

export default connect<{}, {}, ISignupLoginRecoverProps>(mapStateToProps, dispatchAndMapActions)(SignupLoginRecover)
