import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { TextInputError, TextInputErrorProps } from "../../components/ui/TextInputError"

const mapStateToProps = state => ({
	error: state.messages,
})

const dispatchAndMapActions = dispatch => bindActionCreators({}, dispatch)

export default connect<{}, {}, TextInputErrorProps>(mapStateToProps, dispatchAndMapActions)(TextInputError)
