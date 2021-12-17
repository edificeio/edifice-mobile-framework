import I18n from 'i18n-js';
import * as React from 'react';

import { EmptyScreen } from '~/ui/EmptyScreen';
import { FilterId } from '~/workspace/types/filters';

export const getEmptyScreen = (parentId: string): React.ReactElement => {
  switch (parentId) {
    case FilterId.owner: {
      return (
        <EmptyScreen
          imageSrc={require('ASSETS/images/empty-screen/empty-workspace.png')}
          imgWidth={400}
          imgHeight={316}
          text={I18n.t('owner-emptyScreenText')}
          title={I18n.t('owner-emptyScreenTitle')}
          scale={0.76}
        />
      );
    }
    case FilterId.protected: {
      return (
        <EmptyScreen
          imageSrc={require('ASSETS/images/empty-screen/empty-workspace.png')}
          imgWidth={400}
          imgHeight={316}
          text={I18n.t('protected-emptyScreenText')}
          title={I18n.t('protected-emptyScreenTitle')}
          scale={0.76}
        />
      );
    }
    case FilterId.shared: {
      return (
        <EmptyScreen
          imageSrc={require('ASSETS/images/empty-screen/empty-workspace.png')}
          imgWidth={400}
          imgHeight={316}
          text={I18n.t('share-emptyScreenText')}
          title={I18n.t('share-emptyScreenTitle')}
          scale={0.76}
        />
      );
    }
    case FilterId.trash: {
      return (
        <EmptyScreen
          imageSrc={require('ASSETS/images/empty-screen/empty-trash.png')}
          imgWidth={400}
          imgHeight={507}
          text={I18n.t('trash-emptyScreenText')}
          title={I18n.t('trash-emptyScreenTitle')}
          scale={0.76}
        />
      );
    }
    default: {
      return (
        <EmptyScreen
          imageSrc={require('ASSETS/images/empty-screen/empty-search.png')}
          imgWidth={400}
          imgHeight={393}
          text={I18n.t('subFolder-emptyScreenText')}
          title={I18n.t('subFolder-emptyScreenTitle')}
          scale={0.76}
        />
      );
    }
  }
};
