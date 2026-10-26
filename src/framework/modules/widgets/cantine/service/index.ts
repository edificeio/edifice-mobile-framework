import moment from 'moment';

import { CantineData } from '~/framework/modules/widgets/cantine/model';
import { ISO_DATE_FORMAT } from '~/framework/util/date';
import { sessionFetch } from '~/framework/util/transport';

export const cantineService = {
  menu: (uai: string, date: moment.Moment) =>
    sessionFetch.json<CantineData>(`/appregistry/${uai}/cantine/menu?date=${date.format(ISO_DATE_FORMAT)}`),
};
