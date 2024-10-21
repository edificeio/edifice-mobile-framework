/**
 * Loading content boilerplateas a set of React hooks
 */
import * as React from 'react';
import { RefreshControl, ScrollView, ScrollViewProps } from 'react-native';

import { EmptyConnectionScreen } from '~/framework/components/empty-screens';
import { LoadingIndicator } from '~/framework/components/loading';

export interface ContentLoaderProps {
  initialLoadingState?: LoadingState;
  loadContent: () => Promise<any>;
  renderContent: (refreshControl: ScrollViewProps['refreshControl']) => React.ReactElement;
  renderError?: (refreshControl: ScrollViewProps['refreshControl']) => React.ReactElement;
  renderLoading?: () => React.ReactElement;
}

export interface ContentLoaderHandle {
  refresh: () => void;
  refreshSilent: () => void;
}

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
    if (loadingState === LoadingState.DONE) {
      setLoadingState(LoadingState.REFRESH);
      load()
        .then(() => setLoadingState(LoadingState.DONE))
        .catch(() => setLoadingState(LoadingState.REFRESH_FAILED));
    }
  };
  const refreshSilent = () => {
    if (loadingState === LoadingState.DONE) {
      setLoadingState(LoadingState.REFRESH_SILENT);
      load()
        .then(() => setLoadingState(LoadingState.DONE))
        .catch(() => setLoadingState(LoadingState.REFRESH_FAILED));
    }
  };
  return { loadingState, refresh, refreshSilent, reload };
};

export const ContentLoader = React.forwardRef<ContentLoaderHandle, ContentLoaderProps>(
  ({ initialLoadingState, loadContent, renderContent, renderError, renderLoading }, ref) => {
    const { loadingState, refresh, refreshSilent, reload } = useLoadingState(loadContent, initialLoadingState);
    React.useImperativeHandle(ref, () => ({ refresh, refreshSilent }));

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
);
