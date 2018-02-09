import { PATH_CURRENT_USER, PATH_USER } from "../constants/paths"
import {read, readId} from "./docs"

export const readUserFromId = (id: string) => readId(PATH_USER, id)

export const readCurrentUser = () => read(PATH_CURRENT_USER)
