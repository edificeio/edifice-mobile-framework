import { applyMiddleware, createStore } from "redux"
import authMiddleware from "../middleware/Auth"
import fetchMiddleware from "../middleware/Fetch"
import trackingMiddleware from "../middleware/Tracking"
import navigation from "../middleware/Navigation"
import reducers from "../model"

const middlewares = [authMiddleware, fetchMiddleware, trackingMiddleware, navigation]
const enhancer = applyMiddleware(...middlewares)

export default () => createStore(reducers, enhancer)
