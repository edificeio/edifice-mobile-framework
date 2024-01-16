import moment, { Moment } from 'moment';

import { ISession } from '~/framework/modules/auth/model';
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
    start: moment(exclusion.start, 'DD/MM/YYYY'),
    end: moment(exclusion.start, 'DD/MM/YYYY'),
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
        start: moment(`${config.settings.opening_time.start.hour}:${config.settings.opening_time.start.minute}`, 'HH:mm'),
        end: moment(`${config.settings.opening_time.end.hour}:${config.settings.opening_time.end.minute}`, 'HH:mm'),
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
    get: async (session: ISession) => {
      const api = '/homework-assistance/config';
      const config = (await fetchJSONWithCache(api)) as IBackendHomeworkAssistanceConfig;
      return homeworkAssistanceConfigAdapter(config) as IConfig;
    },
  },
  services: {
    get: async (session: ISession) => {
      const api = '/homework-assistance/services/all';
      const services = (await fetchJSONWithCache(api)) as IBackendHomeworkAssistanceServices;
      return homeworkAssistanceServicesAdapter(services);
    },
  },
  service: {
    addRequest: async (
      session: ISession,
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
        destination: phoneNumber,
        callback_date: date.format(),
        callback_time: {
          hour: time.format('HH'),
          minute: Number(time.format('mm')),
        },
        userdata: {
          prenom: firstName,
          nom: lastName,
          etablissement: structure,
          classe: className,
          matiere: service.label,
          service: service.value,
        },
        informations_complementaires: information,
      });
      const response = (await signedFetchJson(`${session.platform.url}${api}`, {
        method: 'POST',
        body,
      })) as { status: string };
      return response;
    },
  },
};
