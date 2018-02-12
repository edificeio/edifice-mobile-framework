import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { readConversation, readNextThreads, readPrevThreads } from "../actions/conversation"
import { Conversations, IConversationsProps } from "../conversation/Conversations"
import { IThreadModel, IThreadState } from "../model/Thread"

function getTitle(displayNames) {
	return displayNames.reduce((acc, elem) => `${acc}, ${elem[1]}`, "")
}

/**
 * Say if elem is a root conversationItem
 */
const filterRootConversation = (elem: IThreadModel, filterCriteria): boolean => {
	if (elem.conversation && elem.conversation !== elem.id) {
		return false
	}

	if (elem.parent_id !== null) {
		return false
	}

	if (filterCriteria) {
		return getTitle(elem.displayNames).match(filterCriteria)
	} else {
		return true
	}
}

/**
 * Select the set of conversations with the filtering criteria
 */
const filtering = (threads: IThreadState): IThreadModel[] => {
	const { filterCriteria = null, payload } = threads

	return payload
		.filter(elem => filterRootConversation(elem, filterCriteria))
		.sort((a: IThreadModel, b: IThreadModel) => b.date - a.date)
}

const mapStateToProps = state => ({
	conversations: filtering(state.threads),
	user: state.auth.userId
})

const dispatchAndMapActions = dispatch =>
	bindActionCreators({ readConversation }, dispatch)

export default connect<{}, {}, IConversationsProps>(mapStateToProps, dispatchAndMapActions)(Conversations)
