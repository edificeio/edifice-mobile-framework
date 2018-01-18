import {PATH_AVATAR} from "../constants/paths"
import { readId } from "./docs"


export const readAvatar= (id: string) => readId(PATH_AVATAR, id, false)