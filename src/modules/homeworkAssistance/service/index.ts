import moment from 'moment';

import { IUserSession } from '~/framework/util/session';
import { fetchJSONWithCache } from '~/infra/fetchWithCache';
import { IConfig, IExclusion } from '~/modules/homeworkAssistance/reducer';

interface IBackendHomeworkAssistanceExclusion {
  start: string;
  end: string;
}

type IBackendHomeworkAssistanceConfig = {
  messages: {
    body: string;
    days: string;
    header: string;
    info: string;
    time: string;
  };
  settings: {
    exclusions: IBackendHomeworkAssistanceExclusion[];
    opening_days: {
      monday: boolean;
      tuesday: boolean;
      wednesday: boolean;
      thursday: boolean;
      friday: boolean;
      saturday: boolean;
      sunday: boolean;
    };
    opening_time: {
      start: {
        hour: string;
        minute: string;
      };
      end: {
        hour: string;
        minute: string;
      };
    };
  };
};

type IBackendHomeworkAssistanceServices = {
  [key: string]: number;
};

const homeworkAssistanceExclusionAdapter = (exclusion: IBackendHomeworkAssistanceExclusion) => {
  return {
    start: moment(exclusion.start),
    end: moment(exclusion.start),
  } as IExclusion;
};

const homeworkAssistanceConfigAdapter = (config: IBackendHomeworkAssistanceConfig) => {
  return {
    messages: {
      body: config.messages.body,
      days: config.messages.days,
      header: config.messages.header,
      info: config.messages.info,
      time: config.messages.time,
    },
    settings: {
      exclusions: config.settings.exclusions.map(exclusion => homeworkAssistanceExclusionAdapter(exclusion)),
      openingDays: {
        monday: config.settings.opening_days.monday,
        tuesday: config.settings.opening_days.tuesday,
        wednesday: config.settings.opening_days.wednesday,
        thursday: config.settings.opening_days.thursday,
        friday: config.settings.opening_days.friday,
        saturday: config.settings.opening_days.saturday,
        sunday: config.settings.opening_days.sunday,
      },
      openingTime: {
        start: {
          hour: config.settings.opening_time.start.hour,
          minute: config.settings.opening_time.start.minute,
        },
        end: {
          hour: config.settings.opening_time.end.hour,
          minute: config.settings.opening_time.end.minute,
        },
      },
    },
  } as IConfig;
};

const homeworkAssistanceServicesAdapter = (services: IBackendHomeworkAssistanceServices) => {
  return Object.keys(services);
};

export const homeworkAssistanceService = {
  config: {
    get: async (session: IUserSession) => {
      const api = '/homework-assistance/config';
      const config = (await fetchJSONWithCache(api)) as IBackendHomeworkAssistanceConfig;
      return homeworkAssistanceConfigAdapter(config) as IConfig;
    },
  },
  services: {
    get: async (session: IUserSession) => {
      const api = '/homework-assistance/services/all';
      const services = (await fetchJSONWithCache(api)) as IBackendHomeworkAssistanceServices;
      return homeworkAssistanceServicesAdapter(services);
    },
  },
};
