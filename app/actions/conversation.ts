import { PATH_CONVERSATION, PATH_CREATE_CONVERSATION } from "../constants/paths"
import { create, read } from "./docs"

/**
 * Retourne le détail d'un expert
 *
 * @param page   page à lire de la conversation   id de l'expert
 */
export const readConversation = () => read(PATH_CONVERSATION, true)

/**
 * Retourne le détail d'un expert
 *
 * @param page   page à lire de la conversation   id de l'expert
 */
export const createConversation = payload => create(PATH_CREATE_CONVERSATION, payload, false)
