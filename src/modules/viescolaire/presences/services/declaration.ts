import moment from "moment";
import RNFB from "rn-fetch-blob";

import Conf from "../../../../../ode-framework-conf";
import { fetchJSONWithCache } from "../../../../infra/fetchWithCache";
import { getAuthHeader } from "../../../../infra/oauth";

export const absenceDeclarationService = {
  post: async (
    startDate: moment.Moment,
    endDate: moment.Moment,
    studentId: string,
    structureId: string,
    description: string
  ) => {
    const formData: FormData = new FormData();

    formData.append("start_at", startDate.format("YYYY-MM-DD HH:mm:ss"));
    formData.append("end_at", endDate.format("YYYY-MM-DD HH:mm:ss"));
    formData.append("structure_id", structureId);
    formData.append("student_id", studentId);
    formData.append("description", description);
    formData.append("file", "null");

    await fetchJSONWithCache("/presences/statements/absences", {
      method: "POST",
      body: formData,
    });
  },
  postWithFile: async (
    startDate: moment.Moment,
    endDate: moment.Moment,
    studentId: string,
    structureId: string,
    description: string,
    file: { mime: string; name: string; uri: string }
  ) => {
    const url = `${Conf.currentPlatform.url}/presences/statements/absences/attachment`;
    const headers = { ...getAuthHeader(), "Content-Type": "multipart/form-data" };

    RNFB.fetch("POST", url, headers, [
      { name: "file", filename: file.name, type: file.mime, data: RNFB.wrap(file.uri) },
      { name: "start_at", data: startDate.format("YYYY-MM-DD HH:mm:ss") },
      { name: "end_at", data: endDate.format("YYYY-MM-DD HH:mm:ss") },
      { name: "structure_id", data: structureId },
      { name: "student_id", data: studentId },
      { name: "description", data: description },
    ]).catch(err => {
      console.error(err);
    });
  },
};
