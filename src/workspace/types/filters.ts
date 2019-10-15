import { FilterId } from "./entity";

export const filters = (value: string | null): FilterId => {
  switch (value) {
    case "owner":
    case null:
      return FilterId.owner
    case "shared":
      return FilterId.shared
    case "protected":
      return FilterId.protected
    case "trash":
      return FilterId.trash
    default:
      return FilterId.owner
  }
}