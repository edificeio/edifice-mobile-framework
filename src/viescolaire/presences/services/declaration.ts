import moment from "moment";

import { fetchJSONWithCache } from "../../../infra/fetchWithCache";

export const absenceDeclarationService = {
  post: async (
    startDate: moment.Moment,
    endDate: moment.Moment,
    studentId: string,
    structureId: string,
    description: string
  ) => {
    const formData = new FormData();

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
};
