import {
	PATH_CONVERSATION,
	PATH_CREATE_CONVERSATION,
	PATH_NEW_MESSAGES,
	PATH_NEWS,
	PATH_PREVIOUS_MESSAGES,
	replace1,
} from "../constants/paths"
import { create, read, readNext } from "./docs"

export const readConversation = (page = 0) => read(replace1(PATH_CONVERSATION, page), false)

export const readNextConversation = page => readNext(PATH_CONVERSATION, page, false)

export const readNextThreads = id => readNext(PATH_NEW_MESSAGES, id, false)

export const readPrevThreads = id => readNext(PATH_PREVIOUS_MESSAGES, id, false)

export const createConversation = payload => create(PATH_CREATE_CONVERSATION, payload, false)
