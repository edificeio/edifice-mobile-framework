import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { readConversation } from '../actions/conversation'
import {Conversation, ConversationProps} from '../components/Conversation'

const mapStateToProps = (state, props) => ({
    inbox: state.inbox,
})

const dispatchAndMapActions = dispatch => bindActionCreators({readConversation}, dispatch)

export default connect<{}, {}, ConversationProps>(mapStateToProps, dispatchAndMapActions)(Conversation)