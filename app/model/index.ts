import { combineReducers } from 'redux'
import { Conversation} from './Conversation'
import { Documents} from './Documents'
import { Auth} from './Auth'

export default combineReducers({
  auth: Auth,
  inbox: Conversation,
  documents: Documents,
})
