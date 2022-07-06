import I18n from 'i18n-js';
import * as React from 'react';

import { EmptyScreen } from '~/framework/components/emptyScreen';
import { Filter } from '~/modules/workspace/types/filters';

export const renderEmptyScreen = (parentId: Filter) => {
  if (parentId === Filter.TRASH) {
    return (
      <EmptyScreen
        svgImage="empty-trash"
        text={I18n.t('workspaceEmptyScreen.trashed.text')}
        title={I18n.t('workspaceEmptyScreen.trashed.title')}
      />
    );
  } else if (Object.values(Filter).includes(parentId as Filter)) {
    return (
      <EmptyScreen
        svgImage="empty-workspace"
        text={I18n.t(`workspaceEmptyScreen.${parentId}.text`)}
        title={I18n.t(`workspaceEmptyScreen.${parentId}.title`)}
      />
    );
  }
  return (
    <EmptyScreen
      svgImage="empty-workspace"
      text={I18n.t('workspaceEmptyScreen.subfolder.text')}
      title={I18n.t('workspaceEmptyScreen.subfolder.title')}
    />
  );
};
