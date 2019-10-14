import { Filters } from "../../types/entity";

export const filters = (value: string): Filters => {
  if (value == "owner")
    return Filters.owner
  else if (value == "shared")
    return Filters.shared
  else if (value == "protected")
    return Filters.protected
  else if (value == "trash")
    return Filters.trash
  return Filters.owner
}