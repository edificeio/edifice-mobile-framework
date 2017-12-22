import {PATH_DOCUMENT} from '../constants/paths'
import {read} from './docs'


export enum Filter {
    Shared = "filter=shared",
    Protected = "filter=protected",
    Public = "filter=public",
}

/**
 * Return a list of documents according the filtering
 *
 * @param filter   type of filter to query documnts
 */
export const readDocumentsFilter = (filter: Filter)  => read(`${PATH_DOCUMENT}?${filter}`, true)

