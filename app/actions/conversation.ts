import {
	PATH_CONVERSATION,
	PATH_CREATE_CONVERSATION,
	PATH_NEW_MESSAGES,
	PATH_PREVIOUS_MESSAGES,
} from "../constants/paths"
import { create, read, readNext } from "./docs"

export const readConversation = () => read(PATH_CONVERSATION, true)

export const readNextThreads = () => readNext(PATH_NEW_MESSAGES, true)

export const readPrevThreads = () => read(PATH_PREVIOUS_MESSAGES, true)

export const createConversation = payload => create(PATH_CREATE_CONVERSATION, payload, false)