import { PATH_NEWS } from "../constants/paths"
import { replace1 } from "../constants/paths"
import { readNext } from "./docs"

export enum Filter {
	Shared = "shared",
	Protected = "protected",
	Public = "public",
}

/**
 * Return a list of documents according the filtering
 *
 * @param filter   type of filter to query documnts
 */
export const readNews = (page = 0) => readNext(PATH_NEWS, page)
