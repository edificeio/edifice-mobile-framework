import { fetchJSONWithCache } from "../../../../infra/fetchWithCache";
import { IMultipleSlots } from "../state/multipleSlots";

export type IMultipleSlotsBackend = {
  allow_multiple_slots: boolean;
};

const multipleSlotsAdapter: (data: IMultipleSlotsBackend) => IMultipleSlots = data => {
  let result = {} as IMultipleSlots;
  if (!data) return result;
  result = {
    allow_multiple_slots: data.allow_multiple_slots,
  };
  return result;
};

export const multipleSlotsService = {
  get: async (structure: string) => {
    return multipleSlotsAdapter(await fetchJSONWithCache(`/presences/structures/${structure}/settings/multiple-slots`));
  },
};
