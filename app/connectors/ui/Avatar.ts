import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { readAvatar } from "../../actions/avatar"
import { Avatar, IAvatarProps } from "../../components/ui/Avatars/Avatar"

const mapStateToProps = (state, ownProps) => ({
	avatar: state.avatars[ownProps.id],
})

const dispatchAndMapActions = dispatch => bindActionCreators({ readAvatar }, dispatch)

export default connect<{}, {}, IAvatarProps>(mapStateToProps, dispatchAndMapActions)(Avatar)
