import { FilterId } from "../filters";
import { IRight } from "./right";

export type IDetails = IRight & {
  date: number,
  id: string,
  name: string,
}

export interface IStateDetails {
  [key: string]: IDetails;
}
