import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { readConversation, readNextConversation } from "../actions/conversation"
import { Conversations, IConversationsProps } from "../conversation/Conversations"
import { IThreadModel, IThreadState } from "../model/Thread"

function getTitle(displayNames) {
	return displayNames.reduce((acc, elem) => `${acc}, ${elem[1]}`, "")
}

/**
 * Select the set of conversations with the filtering criteria
 */
const filtering = (threads: IThreadState): IThreadModel[] => {
	console.log(threads)
	const { filterCriteria = null, payload } = threads

	return payload
		.map(c => {
			const thread = c[0];
			thread.nb = c.filter(e => e.unread).length;
			return thread;
		})
		.sort((a: IThreadModel, b: IThreadModel) => b.date - a.date);
}

const mapStateToProps = state => ({
	conversations: filtering(state.threads),
	userId: state.auth.userId,
})

const dispatchAndMapActions = dispatch =>
	bindActionCreators({ readConversation, readNextConversation }, dispatch)

export default connect(mapStateToProps, dispatchAndMapActions)(Conversations)
