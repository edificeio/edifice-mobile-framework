import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { logout } from "../actions/auth"
import { IUserProfileProps, UserProfile } from "../Profile/UserProfile"

const mapStateToProps = state => ({
	auth: state.auth,
})

const dispatchAndMapActions = dispatch => bindActionCreators({ logout }, dispatch)

export default connect<{}, {}, IUserProfileProps>(mapStateToProps, dispatchAndMapActions)(UserProfile)
