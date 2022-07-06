import I18n from 'i18n-js';

import { Filter, IFolder } from '~/modules/workspace/types';

export const factoryRootFolder = (filter: Filter): IFolder => {
  return {
    date: 0,
    id: filter,
    isFolder: true,
    name: I18n.t(filter),
    number: 1,
    owner: '',
    ownerName: '',
    contentType: 'text',
  };
};
