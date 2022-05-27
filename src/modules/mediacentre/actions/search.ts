import { Dispatch } from 'redux';

import { createAsyncActionCreators } from '~/infra/redux/async2';
import { Field, Sources } from '~/modules/mediacentre/components/AdvancedSearchModal';
import { searchService } from '~/modules/mediacentre/services/search';
import { signetsService } from '~/modules/mediacentre/services/signets';
import { compareResources } from '~/modules/mediacentre/services/textbooks';
import { ISearch, actionTypes } from '~/modules/mediacentre/state/search';
import { Source } from '~/modules/mediacentre/utils/Resource';

// ACTION LIST ------------------------------------------------------------------------------------

const dataActions = createAsyncActionCreators<ISearch>(actionTypes);

// THUNKS -----------------------------------------------------------------------------------------

export function searchResourcesAction(sources: string[], query: string) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.request());
      const data = await searchService.getSimple(sources, query);
      if (sources.includes(Source.Signet)) {
        const signets = await signetsService.searchSimple(query);
        signets.forEach(signet => {
          if (!data.find(resource => String(resource.id) === String(signet.id))) {
            data.push(signet);
          }
        });
        data.sort(compareResources);
      }
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}

export function searchResourcesAdvancedAction(fields: Field[], sources: Sources) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.request());
      const data = await searchService.getAdvanced(fields, sources);
      if (sources.Signets === true) {
        const signets = await signetsService.searchAdvanced(fields);
        signets.forEach(signet => {
          if (!data.find(resource => String(resource.id) === String(signet.id))) {
            data.push(signet);
          }
        });
        data.sort(compareResources);
      }
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
