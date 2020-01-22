import { IItem } from "./items";
import { ISelectState } from "../../reducers/select";

export type ICopyPast = {
  selected: ISelectState<IItem> | { "empty": boolean};
  cut: boolean;
};
