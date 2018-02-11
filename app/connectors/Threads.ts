import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import {readConversation, readNextThreads, readPrevThreads} from "../actions/conversation"
import { IThreadsProps, Threads } from "../conversation/Threads"
import { IThreadModel, IThreadState } from "../model/Thread"

const filterThreads = (elem: IThreadModel, conversationId): boolean => {
	return elem.conversation === conversationId || elem.id === conversationId
}

/**
 * Select the thread of conversation with conversation === conversationId
 */
const filtering = (threads: IThreadState, conversationId): IThreadModel[] => {
	const { payload } = threads

	return payload.filter(elem => filterThreads(elem, conversationId))
}

const mapStateToProps = (state, props) => ({
	threads: filtering(state.threads, props.navigation.state.params.conversationId).sort((a, b) => a.date - b.date),
	userId: state.auth.userId,
})

const dispatchAndMapActions = dispatch => bindActionCreators({ readNextThreads, readPrevThreads }, dispatch)

export default connect<{}, {}, IThreadsProps>(mapStateToProps, dispatchAndMapActions)(Threads)
