import * as React from 'react';

import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

import { I18n } from '~/app/i18n';
import { NavBarAction } from '~/framework/components/navigation';
import { PageView } from '~/framework/components/page';
import ScrollView from '~/framework/components/scrollView';
import { SmallText } from '~/framework/components/text';
import { withSession } from '~/framework/modules/auth/util';
import { CarnetDeBordDetailList } from '~/framework/modules/widgets/carnet-de-board/components/detail-list';
import { CarnetDeBordPronoteButton } from '~/framework/modules/widgets/carnet-de-board/components/pronote-button';
import {
  CarnetDeBordSection,
  getDetailItems,
  getPronotePageId,
  SECTION_TITLE,
} from '~/framework/modules/widgets/carnet-de-board/model';
import { navBarOptions } from '~/framework/navigation/navBar';

import styles from './styles';
import { CarnetDeBordDetailsScreenProps } from './types';

export const computeNavBar = ({ navigation, route }: CarnetDeBordDetailsScreenProps): NativeStackNavigationOptions => {
  const options = navBarOptions({ navigation, route, title: I18n.get(SECTION_TITLE[route.params.type]) });

  return {
    ...options,
    // Opened from the home widget, this screen stands alone in the modal, so the stack draws no
    // button. Leaving it then means closing the modal, as on the carnet de bord itself.
    headerLeft: props =>
      options.headerLeft?.(props) ?? (
        <NavBarAction icon="ui-close" onPress={navigation.goBack} testID="carnet-de-bord-details-close-button" />
      ),
  };
};

export const CarnetDeBordDetailsScreen = withSession<CarnetDeBordDetailsScreenProps>(({ route, session }) => {
  const { data, type } = route.params;

  const items = React.useMemo(() => getDetailItems(type, data), [data, type]);
  const pageId = React.useMemo(() => getPronotePageId(type, data), [data, type]);

  // Pronote sends its own word on the transcript, and on that section only.
  const message = type === CarnetDeBordSection.NOTES ? data.PageReleveDeNotes?.Message : undefined;

  return (
    <PageView>
      <ScrollView alwaysBounceVertical={false}>
        {message ? <SmallText style={styles.message}>{message}</SmallText> : null}
        <CarnetDeBordDetailList items={items} style={styles.list} />
        <CarnetDeBordPronoteButton address={data.address} pageId={pageId} session={session} />
      </ScrollView>
    </PageView>
  );
});

export default CarnetDeBordDetailsScreen;
