import { PATH_USER } from "../constants/paths"
import { readId } from "./docs"

export const readUser = (id: string) => readId(PATH_USER, id)
