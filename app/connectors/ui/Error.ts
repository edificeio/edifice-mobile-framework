import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { Error, ErrorProps } from "../../ui/Error"
export { ErrorProps } from "../../ui/Error"

const mapStateToProps = state => ({
	messages: state.messages,
})

const dispatchAndMapActions = dispatch => {
	return bindActionCreators({}, dispatch)
}

export default connect<{}, {}, ErrorProps>(mapStateToProps, dispatchAndMapActions)(Error)
