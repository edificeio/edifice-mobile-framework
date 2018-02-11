import {
	PATH_CONVERSATION,
	PATH_CREATE_CONVERSATION,
	PATH_NEW_MESSAGES,
	PATH_PREVIOUS_MESSAGES,
} from "../constants/paths"
import { create, read, readMerge } from "./docs"

export const readConversation = () => read(PATH_CONVERSATION, true)

export const readNextThreads = () => readMerge(PATH_NEW_MESSAGES, true)

export const readPrevThreads = () => readMerge(PATH_PREVIOUS_MESSAGES, true)

export const createConversation = payload => create(PATH_CREATE_CONVERSATION, payload, false)