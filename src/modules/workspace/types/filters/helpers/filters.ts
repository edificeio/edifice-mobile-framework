import { Filter } from '~/modules/workspace/types/index';

export const filters = (value: string | null): Filter => {
  switch (value) {
    case 'owner':
    case null:
      return Filter.OWNER;
    case 'shared':
      return Filter.SHARED;
    case 'protected':
      return Filter.PROTECTED;
    case 'trash':
      return Filter.TRASH;
    default:
      return Filter.OWNER;
  }
};
