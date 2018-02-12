import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { readNextConversation, readNextThreads, readPrevThreads } from "../actions/conversation"
import { IThreadsProps, Threads } from "../conversation/Threads"
import { IThreadModel, IThreadState } from "../model/Thread"

const filterThreads = (elem: IThreadModel, conversationId): boolean => {
	return elem.conversation === conversationId || elem.id === conversationId
}

/**
 * Select the thread of conversation with conversation === conversationId
 */
const filtering = (threads: IThreadState, conversationId): IThreadModel[] => {
	return [...threads.payload, ...threads.processing].filter(elem => filterThreads(elem, conversationId))
}

const mapStateToProps = (state, props) => ({
	merge: state.threads.merge,
	threads: filtering(state.threads, props.navigation.state.params.conversationId).sort((a, b) => a.date - b.date),
	pageNumber: state.threads.pageNumber,
	synced: state.threads.synced,
	userId: state.auth.userId,
})

const dispatchAndMapActions = dispatch =>
	bindActionCreators({ readNextConversation, readNextThreads, readPrevThreads }, dispatch)

export default connect<{}, {}, IThreadsProps>(mapStateToProps, dispatchAndMapActions)(Threads)
