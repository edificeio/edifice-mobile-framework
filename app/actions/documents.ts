import {PATH_DOCUMENT} from '../constants/paths'
import {read} from './docs'
import { replace1 } from '../constants/paths'


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
export const readDocumentsFilter = (filter: Filter)  => read(replace1(PATH_DOCUMENT, filter), true)

