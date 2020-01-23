import { IItem } from "./items";
import { IItems } from "../../reducers/select";

export type ICopyPast = {
  selected: IItems<IItem> | { empty: boolean };
  cut: boolean;
};
