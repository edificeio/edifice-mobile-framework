import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { ProgressBar } from "../../ui"

const mapStateToProps = state => ({
	synced: [state.auth.synced], // state.timeline.isFetching],
})

const dispatchAndMapActions = dispatch => bindActionCreators({}, dispatch)

export default connect(mapStateToProps, dispatchAndMapActions)(ProgressBar)
