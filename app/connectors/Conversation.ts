import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { readConversation } from "../actions/conversation"
import { Conversation, ConversationProps } from "../components/Conversation"

function getTitle(displayNames) {
	return displayNames.reduce((acc, elem) => `${acc}, ${elem[1]}`, "")
}

const filtering = state => {
	const { filter, payload } = state

	if (filter !== null) {
		return payload.filter(elem => getTitle(elem.displayNames).match(filter))
	} else {
		return payload
	}
}

const mapStateToProps = state => ({
	conversations: filtering(state.conversations),
})

const dispatchAndMapActions = dispatch => bindActionCreators({ readConversation }, dispatch)

export default connect<{}, {}, ConversationProps>(mapStateToProps, dispatchAndMapActions)(Conversation)
