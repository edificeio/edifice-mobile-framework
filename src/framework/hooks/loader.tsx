/**
 * Loading content boilerplateas a set of React hooks
 */
import * as React from 'react';
import { RefreshControl, ScrollView, ScrollViewProps } from 'react-native';

import { EmptyConnectionScreen } from '~/framework/components/empty-screens';
import { LoadingIndicator } from '~/framework/components/loading';

export enum LoadingState {
  PRISTINE, // When no data has been fetched yet
  INIT, // When data is fetching for the first time
  INIT_FAILED, // When the first-time fetch failed
  RETRY, // When we fetch again after a failing first-time fetch
  REFRESH, // When we refresh the list with visual feedback
  REFRESH_SILENT, // When we refresh the list without visual feedback
  REFRESH_FAILED, // When the refresh has failed
  DONE, // When the last fetch has been successful
}

export const useLoadingState = (load: () => Promise<void>, initialLoadingState = LoadingState.PRISTINE) => {
  const [loadingState, setLoadingState] = React.useState<LoadingState>(initialLoadingState);
  React.useEffect(() => {
    if (loadingState === LoadingState.PRISTINE) {
      setLoadingState(LoadingState.INIT);
      load()
        .then(() => setLoadingState(LoadingState.DONE))
        .catch(() => setLoadingState(LoadingState.INIT_FAILED));
    }
  }, [load, loadingState]);
  const reload = () => {
    setLoadingState(LoadingState.RETRY);
    load()
      .then(() => setLoadingState(LoadingState.DONE))
      .catch(() => setLoadingState(LoadingState.INIT_FAILED));
  };
  const refresh = () => {
    setLoadingState(LoadingState.REFRESH);
    load()
      .then(() => setLoadingState(LoadingState.DONE))
      .catch(() => setLoadingState(LoadingState.REFRESH_FAILED));
  };
  return { loadingState, reload, refresh };
};

export function ContentLoader({
  loadContent,
  initialLoadingState,
  renderLoading,
  renderError,
  renderContent,
}: {
  loadContent: () => Promise<any>;
  initialLoadingState?: LoadingState;
  renderLoading?: () => React.ReactElement;
  renderError?: (refreshControl: ScrollViewProps['refreshControl']) => React.ReactElement;
  renderContent: (refreshControl: ScrollViewProps['refreshControl']) => React.ReactElement;
}) {
  const { loadingState, reload, refresh } = useLoadingState(loadContent, initialLoadingState);
  switch (loadingState) {
    case LoadingState.DONE:
    case LoadingState.REFRESH:
    case LoadingState.REFRESH_FAILED:
    case LoadingState.REFRESH_SILENT:
      return renderContent(<RefreshControl refreshing={loadingState === LoadingState.REFRESH} onRefresh={() => refresh()} />);

    case LoadingState.PRISTINE:
    case LoadingState.INIT:
      return renderLoading ? renderLoading() : <LoadingIndicator />;

    case LoadingState.INIT_FAILED:
    case LoadingState.RETRY:
      return (
        renderError ??
        (refreshControl => (
          <ScrollView refreshControl={refreshControl}>
            <EmptyConnectionScreen />
          </ScrollView>
        ))
      )(<RefreshControl refreshing={loadingState === LoadingState.RETRY} onRefresh={() => reload()} />);
  }
}
