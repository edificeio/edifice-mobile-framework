import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { createConversation } from "../actions/conversation"
import { ThreadsFooterBar, IThreadsFooterBarProps } from "../conversation/ThreadsFooterBar"

const mapStateToProps = state => ({})

const dispatchAndMapActions = dispatch => bindActionCreators({ createConversation }, dispatch)

export default connect<{}, {}, IThreadsFooterBarProps>(mapStateToProps, dispatchAndMapActions)(ThreadsFooterBar)
