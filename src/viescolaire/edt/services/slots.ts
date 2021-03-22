import { fetchJSONWithCache } from "../../../infra/fetchWithCache";
import { ISlotList } from "../state/slots";
import moment from "moment";

export type ISlotListBackend = {
  startHour: string;
  endHour: string;
  name: string;
}[];

const slotsListAdapter = (data: ISlotListBackend): ISlotList => {
  return data.map(slot => ({
    startHour: moment("2000-01-01 " + slot.startHour + ":00"),
    endHour: moment("2000-01-01 " + slot.endHour + ":00"),
    name: slot.name,
  }));
};

export const slotsService = {
  getStructureSlots: async (structureId: string) => {
    const slots = await fetchJSONWithCache(`/edt/time-slots?structureId=${structureId}`);

    return slotsListAdapter(slots);
  },
};
