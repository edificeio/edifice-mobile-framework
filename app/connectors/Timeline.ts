import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { readDocumentsFilter } from "../actions/documents"
import { Timeline, TimelineProps } from "../components/Timeline"

const mapStateToProps = state => ({
	documents: state.documents.payload,
})

const dispatchAndMapActions = dispatch => bindActionCreators({ readDocumentsFilter }, dispatch)

export default connect<{}, {}, TimelineProps>(mapStateToProps, dispatchAndMapActions)(Timeline)
