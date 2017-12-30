import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { checkLogin, login, recoverPassword } from "../../actions/auth"
import { SignupLoginRecover, SignupLoginRecoverProps } from "../../components/auth/SignupLoginRecover"

const mapStateToProps = state => ({
	auth: state.auth,
})

const dispatchAndMapActions = dispatch => bindActionCreators({ login, recoverPassword}, dispatch)

export default connect<{}, {}, SignupLoginRecoverProps>(mapStateToProps, dispatchAndMapActions)(SignupLoginRecover)
