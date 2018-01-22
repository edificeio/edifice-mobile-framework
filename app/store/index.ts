import { applyMiddleware, createStore } from "redux"
import authMiddleware from "../middleware/Auth"
import fetchMiddleware from "../middleware/Fetch"
import navigation from "../middleware/Navigation"
import reducers from "../model"

export default () => createStore(reducers, applyMiddleware(authMiddleware, fetchMiddleware, navigation))
