import moment, { Moment } from 'moment';

import { AuthLoggedAccount } from '~/framework/modules/auth/model';
import { IConfig, IExclusion, IService } from '~/framework/modules/homework-assistance/model';
import { fetchJSONWithCache, signedFetchJson } from '~/infra/fetchWithCache';

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
    end: moment(exclusion.start, 'DD/MM/YYYY'),
    start: moment(exclusion.start, 'DD/MM/YYYY'),
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
        friday: config.settings.opening_days.friday,
        monday: config.settings.opening_days.monday,
        saturday: config.settings.opening_days.saturday,
        sunday: config.settings.opening_days.sunday,
        thursday: config.settings.opening_days.thursday,
        tuesday: config.settings.opening_days.tuesday,
        wednesday: config.settings.opening_days.wednesday,
      },
      openingTime: {
        end: moment(`${config.settings.opening_time.end.hour}:${config.settings.opening_time.end.minute}`, 'HH:mm'),
        start: moment(`${config.settings.opening_time.start.hour}:${config.settings.opening_time.start.minute}`, 'HH:mm'),
      },
    },
  } as IConfig;
};

const homeworkAssistanceServicesAdapter = (services: IBackendHomeworkAssistanceServices) => {
  return Object.entries(services).map(([key, value]) => {
    return {
      label: key,
      value,
    } as IService;
  });
};

export const homeworkAssistanceService = {
  config: {
    get: async (session: AuthLoggedAccount) => {
      const api = '/homework-assistance/config';
      const config = (await fetchJSONWithCache(api)) as IBackendHomeworkAssistanceConfig;
      return homeworkAssistanceConfigAdapter(config) as IConfig;
    },
  },
  service: {
    addRequest: async (
      session: AuthLoggedAccount,
      service: IService,
      phoneNumber: string,
      date: Moment,
      time: Moment,
      firstName: string,
      lastName: string,
      structure: string,
      className: string,
      information: string,
    ) => {
      const api = `/homework-assistance/services/${service.value}/callback`;
      const body = JSON.stringify({
        callback_date: date.format(),
        callback_time: {
          hour: time.format('HH'),
          minute: Number(time.format('mm')),
        },
        destination: phoneNumber,
        informations_complementaires: information,
        userdata: {
          classe: className,
          etablissement: structure,
          matiere: service.label,
          nom: lastName,
          prenom: firstName,
          service: service.value,
        },
      });
      const response = (await signedFetchJson(`${session.platform.url}${api}`, {
        body,
        method: 'POST',
      })) as { status: string };
      return response;
    },
  },
  services: {
    get: async (session: AuthLoggedAccount) => {
      const api = '/homework-assistance/services/all';
      const services = (await fetchJSONWithCache(api)) as IBackendHomeworkAssistanceServices;
      return homeworkAssistanceServicesAdapter(services);
    },
  },
};
