import moment from 'moment';

import { LocalFile } from '~/framework/util/fileHandler';
import fileTransferService from '~/framework/util/fileHandler/service';
import { IUserSession } from '~/framework/util/session';
import { fetchJSONWithCache } from '~/infra/fetchWithCache';

export const absenceDeclarationService = {
  post: async (startDate: moment.Moment, endDate: moment.Moment, studentId: string, structureId: string, description: string) => {
    const formData: FormData = new FormData();
    formData.append('start_at', startDate.format('YYYY-MM-DD HH:mm:ss'));
    formData.append('end_at', endDate.format('YYYY-MM-DD HH:mm:ss'));
    formData.append('structure_id', structureId);
    formData.append('student_id', studentId);
    formData.append('description', description);
    formData.append('file', 'null');
    await fetchJSONWithCache('/presences/statements/absences', {
      method: 'POST',
      body: formData,
    });
  },
  postWithFile: async (
    startDate: moment.Moment,
    endDate: moment.Moment,
    studentId: string,
    structureId: string,
    description: string,
    file: LocalFile,
    session: IUserSession,
  ) => {
    try {
      await fileTransferService.uploadFile(
        session,
        file,
        {
          url: `/presences/statements/absences/attachment`,
          fields: {
            start_at: startDate.format('YYYY-MM-DD HH:mm:ss'),
            end_at: endDate.format('YYYY-MM-DD HH:mm:ss'),
            structure_id: structureId,
            student_id: studentId,
            description: description,
          },
        },
        res => {
          // console.log(res);
          return undefined!; // No use of distant file. But, it's a bad practice.
        },
        {
          onBegin: res => console.log(res.jobId),
          onProgress: res => console.log(res.totalBytesSent + '/' + res.totalBytesExpectedToSend),
        },
      );
    } catch (e) {
      console.warn(e);
    }
  },
};
