import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { login, recoverPassword } from "../../actions/auth"
import { SignupLoginRecover, SignupLoginRecoverProps } from "../../components/auth/SignupLoginRecover"
import {initialState} from "../../model/Auth"

const mapStateToProps = (state, props) => ({
	auth: props.navigation.state.routeName === "Login" ? { ...initialState, email: props.navigation.state.params.email} : state.auth,
})

const dispatchAndMapActions = dispatch => bindActionCreators({ login, recoverPassword}, dispatch)

export default connect<{}, {}, SignupLoginRecoverProps>(mapStateToProps, dispatchAndMapActions)(SignupLoginRecover)
