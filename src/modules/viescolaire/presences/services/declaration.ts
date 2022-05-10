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
    descriptionText: string,
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
            description: descriptionText,
          },
        },
        res => {
          return undefined!; // No use of distant file. But, it's a bad practice.
        },
        {
          onBegin: res => console.debug(res.jobId),
          onProgress: res => console.debug(res.totalBytesSent + '/' + res.totalBytesExpectedToSend),
        },
      );
    } catch (e) {
      // TODO: Manage error
    }
  },
};
