import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { readConversation } from "../actions/conversation"
import { Conversation, ConversationProps } from "../components/Conversation"

const filter = (state) => {
	const { filter, payload} = state

	if (filter !== null)
		return state.payload.filter( elem => elem.subject.match(filter))
	else
		return state.payload
}

const mapStateToProps = (state, props) => ({
	conversations: filter(state.conversations)
})

const dispatchAndMapActions = dispatch => bindActionCreators({ readConversation }, dispatch)

export default connect<{}, {}, ConversationProps>(mapStateToProps, dispatchAndMapActions)(Conversation)
