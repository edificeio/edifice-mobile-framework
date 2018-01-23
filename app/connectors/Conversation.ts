import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { readConversation } from "../actions/conversation"
import { Conversation, ConversationProps } from "../components/Conversation"
import { IThreadModel } from "../model/Thread"

function getTitle(displayNames) {
	return displayNames.reduce((acc, elem) => `${acc}, ${elem[1]}`, "")
}

/**
 * Say if item is a root conversationItem
 * @param {IThreadModel} elem
 * @param filter
 * @returns {boolean}
 */
const filterRootConversation = (elem: IThreadModel, filter): boolean => {
	if (elem.conversation && elem.conversation !== elem.id) {
		return false
	}

	if (elem.parent_id !== null) {
		return false
	}

	return getTitle(elem.displayNames).match(filter)
}

/**
 * Select the set of conversations with the filtering criteria
 * @param state			The redux store
 * @returns {any}		The list of conversation
 */
const filtering = state => {
	const { filter, payload } = state

	if (filter !== null) {
		return payload.filter(elem => filterRootConversation(elem, filter))
	} else {
		return payload
	}
}

const mapStateToProps = state => ({
	conversations: filtering(state.threads),
})

const dispatchAndMapActions = dispatch => bindActionCreators({ readConversation }, dispatch)

export default connect<{}, {}, ConversationProps>(mapStateToProps, dispatchAndMapActions)(Conversation)
