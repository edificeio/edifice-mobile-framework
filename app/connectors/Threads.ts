import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { readConversation } from "../actions/conversation"
import { Threads, ThreadsProps } from "../components/conversation/Threads"
import { IThreadModel, IThreadState } from "../model/Thread"


/**
 * Select the thread of conversation === conversationId
 */
const filtering = (threads: IThreadState, conversationId): IThreadModel[] => {
	const { payload } = threads

	return payload.filter(elem => elem.conversation !== conversationId || elem.id !== conversationId)
}

const mapStateToProps = (state, props) => ({
	threads: filtering(state.threads, props.navigation.state.params.conversationId),
	userId: state.auth.userId,
})

const dispatchAndMapActions = dispatch => bindActionCreators({ readConversation }, dispatch)

export default connect<{}, {}, ThreadsProps>(mapStateToProps, dispatchAndMapActions)(Threads)
