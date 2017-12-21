import { combineReducers } from 'redux'
import { Conversation} from './Conversation'
import { Auth} from './Auth'

export default combineReducers({
  auth: Auth,
  inbox: Conversation,
})
