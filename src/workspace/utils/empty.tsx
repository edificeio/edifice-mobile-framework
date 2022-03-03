import I18n from 'i18n-js';
import * as React from 'react';

import { FilterId } from '~/workspace/types/filters';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import EmptyTrash from 'ode-images/empty-screen/empty-trash.svg';
import EmptyWorkspace from 'ode-images/empty-screen/empty-workspace.svg';

export const getEmptyScreen = (parentId: string): React.ReactElement => {
  switch (parentId) {
    case FilterId.owner: {
      return (
        <EmptyScreen
          svgImage={<EmptyWorkspace />}
          text={I18n.t('workspaceEmptyScreen.owner.text')}
          title={I18n.t('workspaceEmptyScreen.owner.title')}
        />
      );
    }
    case FilterId.protected: {
      return (
        <EmptyScreen
          svgImage={<EmptyWorkspace />}
          text={I18n.t('workspaceEmptyScreen.protected.text')}
          title={I18n.t('workspaceEmptyScreen.protected.title')}
        />
      );
    }
    case FilterId.shared: {
      return (
        <EmptyScreen
          svgImage={<EmptyWorkspace />}
          text={I18n.t('workspaceEmptyScreen.shared.text')}
          title={I18n.t('workspaceEmptyScreen.shared.title')}
        />
      );
    }
    case FilterId.trash: {
      return (
        <EmptyScreen
          svgImage={<EmptyTrash />}
          text={I18n.t('workspaceEmptyScreen.trashed.text')}
          title={I18n.t('workspaceEmptyScreen.trashed.title')}
        />
      );
    }
    default: {
      return (
        <EmptyScreen
          svgImage={<EmptyWorkspace />}
          text={I18n.t('workspaceEmptyScreen.subfolder.text')}
          title={I18n.t('workspaceEmptyScreen.subfolder.title')}
        />
      );
    }
  }
};
