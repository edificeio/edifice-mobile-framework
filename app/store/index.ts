import { applyMiddleware, createStore } from 'redux'
import authMiddleware from '../middleware/Auth'
import fetchMiddleware from '../middleware/Fetch'
import reducers from '../model'

export default () =>
  createStore(reducers, applyMiddleware(authMiddleware, fetchMiddleware))
