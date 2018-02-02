import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { StatusAlert, StatusAlertProps } from "../../ui/StatusAlert"

const mapStateToProps = state => ({
	messages: state.messages,
})

const dispatchAndMapActions = dispatch => {
	return bindActionCreators({}, dispatch)
}

export default connect<{}, {}, StatusAlertProps>(mapStateToProps, dispatchAndMapActions)(StatusAlert)
