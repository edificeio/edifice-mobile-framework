import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { StatusAlert } from "../../components/ui/StatusAlert"
import { MessagesProps } from "../../model/messages"

const mapStateToProps = state => ({
	messages: state.messages,
})

const dispatchAndMapActions = dispatch => {
	return bindActionCreators({}, dispatch)
}

export default connect<{}, {}, MessagesProps>(mapStateToProps, dispatchAndMapActions)(StatusAlert)
