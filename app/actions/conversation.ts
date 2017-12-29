import { PATH_CONVERSATION } from "../constants/paths"
import { readId } from "./docs"

/**
 * Retourne le détail d'un expert
 *
 * @param page   page à lire de la conversation   id de l'expert
 */
export const readConversation = (page: number) => readId(PATH_CONVERSATION, page, false)
