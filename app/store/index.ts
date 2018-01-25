import { applyMiddleware, createStore  } from "redux"
import { composeWithDevTools } from 'redux-devtools-extension'
import authMiddleware from "../middleware/Auth"
import fetchMiddleware from "../middleware/Fetch"
import navigation from "../middleware/Navigation"
import reducers from "../model"

const middlewares = [authMiddleware, fetchMiddleware, navigation];
const enhancer = composeWithDevTools(
  applyMiddleware(...middlewares),
);

export default () => createStore(reducers, enhancer);
