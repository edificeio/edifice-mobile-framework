import I18n from 'i18n-js';

import { FilterId, IFolder } from '~/modules/workspace/types';

export const factoryRootFolder = (filterId: FilterId): IFolder => {
  return {
    date: 0,
    id: filterId,
    isFolder: true,
    name: I18n.t(filterId),
    number: 1,
    owner: '',
    ownerName: '',
    contentType: 'text',
  };
};
