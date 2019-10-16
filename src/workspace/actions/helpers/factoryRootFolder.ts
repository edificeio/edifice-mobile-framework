import I18n from "i18n-js";
import { FilterId, IItem } from "../../types";

export const factoryRootFolder = ( filterId: FilterId): IItem => {
  return {
    date: 0,
    filter: filterId,
    id: filterId,
    isFolder: true,
    name: I18n.t(filterId),
    number: 1,
    owner: "",
    ownerName: "",
  }
};