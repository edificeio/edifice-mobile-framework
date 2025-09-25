import moment, { Moment } from 'moment';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { Exclusion, ModuleParameters, Resource, Service } from '~/framework/modules/homework-assistance/model';
import { fetchJSONWithCache, signedFetchJson } from '~/infra/fetchWithCache';

interface BackendExclusion {
  start: string;
  end: string;
}

type BackendParameters = {
  messages: {
    header: string;
    body: string;
    days: string;
    time: string;
    info: string;
    title_link: string;
    description_link: string;
    link: string;
  };
  settings: {
    exclusions: BackendExclusion[];
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

type BackendResource = {
  idRessource: string;
  nomRessource: string;
  urlVignette: string;
  urlAccesRessource: string;
  description: string;
};

type BackendServices = {
  [key: string]: number;
};

const exclusionAdapter = (data: BackendExclusion): Exclusion => {
  return {
    end: moment(data.end, 'DD/MM/YYYY'),
    start: moment(data.start, 'DD/MM/YYYY'),
  };
};

const parametersAdapter = (data: BackendParameters): ModuleParameters => {
  return {
    messages: {
      body: data.messages.body,
      days: data.messages.days,
      descriptionLink: data.messages.description_link,
      header: data.messages.header,
      info: data.messages.info,
      link: data.messages.link,
      time: data.messages.time,
      titleLink: data.messages.title_link,
    },
    settings: {
      exclusions: data.settings.exclusions.map(exclusionAdapter),
      openingDays: {
        friday: data.settings.opening_days.friday,
        monday: data.settings.opening_days.monday,
        saturday: data.settings.opening_days.saturday,
        sunday: data.settings.opening_days.sunday,
        thursday: data.settings.opening_days.thursday,
        tuesday: data.settings.opening_days.tuesday,
        wednesday: data.settings.opening_days.wednesday,
      },
      openingTime: {
        end: moment(`${data.settings.opening_time.end.hour}:${data.settings.opening_time.end.minute}`, 'HH:mm'),
        start: moment(`${data.settings.opening_time.start.hour}:${data.settings.opening_time.start.minute}`, 'HH:mm'),
      },
    },
  };
};

const resourceAdapter = (data: BackendResource): Resource => {
  return {
    description: data.description,
    id: data.idRessource,
    name: data.nomRessource,
    pictureUrl: data.urlVignette,
    url: data.urlAccesRessource,
  };
};

const servicesAdapter = (data: BackendServices): Service[] => {
  return Object.entries(data).map(([key, value]) => ({
    label: key,
    value,
  }));
};

export const homeworkAssistanceService = {
  parameters: {
    get: async (session: AuthActiveAccount) => {
      const api = '/homework-assistance/parameters';
      const parameters = (await fetchJSONWithCache(api)) as BackendParameters;
      return parametersAdapter(parameters);
    },
  },
  resources: {
    get: async (session: AuthActiveAccount) => {
      const api = '/homework-assistance/resources';
      const resources = (await fetchJSONWithCache(api)) as BackendResource[];
      return resources.map(resourceAdapter);
    },
  },
  service: {
    addRequest: async (
      session: AuthActiveAccount,
      service: Service,
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
    get: async (session: AuthActiveAccount) => {
      const api = '/homework-assistance/services/all';
      const services = (await fetchJSONWithCache(api)) as BackendServices;
      return servicesAdapter(services);
    },
  },
};
