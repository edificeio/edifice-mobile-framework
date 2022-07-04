import I18n from 'i18n-js';
import * as React from 'react';

import { EmptyScreen } from '~/framework/components/emptyScreen';
import { FilterId } from '~/modules/workspace/types/filters';

export const getEmptyScreen = (parentId: FilterId): React.ReactElement => {
  switch (parentId) {
    case FilterId.owner: {
      return (
        <EmptyScreen
          svgImage="empty-workspace"
          text={I18n.t('workspaceEmptyScreen.owner.text')}
          title={I18n.t('workspaceEmptyScreen.owner.title')}
        />
      );
    }
    case FilterId.protected: {
      return (
        <EmptyScreen
          svgImage="empty-workspace"
          text={I18n.t('workspaceEmptyScreen.protected.text')}
          title={I18n.t('workspaceEmptyScreen.protected.title')}
        />
      );
    }
    case FilterId.shared: {
      return (
        <EmptyScreen
          svgImage="empty-workspace"
          text={I18n.t('workspaceEmptyScreen.shared.text')}
          title={I18n.t('workspaceEmptyScreen.shared.title')}
        />
      );
    }
    case FilterId.trash: {
      return (
        <EmptyScreen
          svgImage="empty-trash"
          text={I18n.t('workspaceEmptyScreen.trashed.text')}
          title={I18n.t('workspaceEmptyScreen.trashed.title')}
        />
      );
    }
    default: {
      return (
        <EmptyScreen
          svgImage="empty-workspace"
          text={I18n.t('workspaceEmptyScreen.subfolder.text')}
          title={I18n.t('workspaceEmptyScreen.subfolder.title')}
        />
      );
    }
  }
};
