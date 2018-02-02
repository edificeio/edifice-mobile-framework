import { applyMiddleware, createStore } from "redux"
import { composeWithDevTools } from "redux-devtools-extension"
import authMiddleware from "../middleware/Auth"
import fetchMiddleware from "../middleware/Fetch"
import trackingMiddleware from "../tracking/middleware"
import navigation from "../middleware/Navigation"
import reducers from "../model"

const middlewares = [authMiddleware, fetchMiddleware, navigation, trackingMiddleware]
const enhancer = composeWithDevTools(applyMiddleware(...middlewares))

export default () => createStore(reducers, enhancer)
