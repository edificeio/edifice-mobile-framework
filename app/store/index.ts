import { applyMiddleware, createStore } from "redux"
import authMiddleware from "../middleware/Auth"
import trackingMiddleware from "../middleware/Tracking"
import navigation from "../middleware/Navigation"
import reducers from "../model"

const middlewares = [authMiddleware, trackingMiddleware, navigation]
const enhancer = applyMiddleware(...middlewares)

export default () => createStore(reducers, enhancer)
