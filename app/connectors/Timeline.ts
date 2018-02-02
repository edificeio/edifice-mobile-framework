import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { readDocumentsFilter } from "../actions/documents"
import { ITimelineProps, Timeline } from "../timeline/Timeline"

const mapStateToProps = state => ({
	documents: state.documents.payload,
})

const dispatchAndMapActions = dispatch => bindActionCreators({ readDocumentsFilter }, dispatch)

export default connect<{}, {}, ITimelineProps>(mapStateToProps, dispatchAndMapActions)(Timeline)
