import * as React from 'react';

import styles from './styles';

import { EmptyScreen } from '~/framework/components/empty-screens';
import { PageView } from '~/framework/components/page';
import { openUrl } from '~/framework/util/linking';

const ZimbraHomeScreen = () => {
  return (
    <PageView style={styles.pageContainer}>
      <EmptyScreen
        svgImage="empty-conversation"
        title="Votre messagerie évolue"
        text="Pour continuer à échanger avec votre établissement et votre réseau, accédez dès maintenant à votre nouvelle messagerie."
        customStyle={styles.emptyListContainer}
        buttonAction={() => openUrl('/auth/carbonio/preauth')}
        buttonText="Découvrir la messagerie"
      />
    </PageView>
  );
};

export default ZimbraHomeScreen;
