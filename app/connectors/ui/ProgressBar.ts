import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { ProgressBar } from "../../ui/ProgressBar"

const mapStateToProps = state => ({
	synced: [state.auth.synced],
})

const dispatchAndMapActions = dispatch => bindActionCreators({}, dispatch)

export default connect(mapStateToProps, dispatchAndMapActions)(ProgressBar)
