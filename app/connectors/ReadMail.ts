import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { readConversation } from '../actions/conversation'
import {ReadMail} from '../components/ReadMail'

const mapStateToProps = (state, props) => ({
    inbox: state.inbox,
})

const dispatchAndMapActions = dispatch => bindActionCreators({ readConversation }, dispatch)

export default connect(mapStateToProps, dispatchAndMapActions)(ReadMail)