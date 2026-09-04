import * as React from 'react';
import { ScrollView, ScrollViewProps, View } from 'react-native';

import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

import { I18n } from '~/app/i18n';
import SecondaryButton from '~/framework/components/buttons/secondary';
import { EmptyScreen } from '~/framework/components/empty-screens';
import { NavBarAction } from '~/framework/components/navigation';
import { PageView } from '~/framework/components/page';
import { SmallBoldText } from '~/framework/components/text';
import UserList from '~/framework/components/UserList';
import { ContentLoader } from '~/framework/hooks/loader';
import { withSession } from '~/framework/modules/auth/util';
import { CarnetDeBordSectionCard } from '~/framework/modules/widgets/carnet-de-board/components/section-card';
import { useCarnetDeBord } from '~/framework/modules/widgets/carnet-de-board/hooks/carnet-de-bord';
import { useSelectedChild } from '~/framework/modules/widgets/carnet-de-board/hooks/selected-child';
import {
  CarnetDeBordSection,
  ICarnetDeBord,
  PronoteCdbInitError,
} from '~/framework/modules/widgets/carnet-de-board/model/carnet-de-bord';
import { getChildId, hasPronoteData } from '~/framework/modules/widgets/carnet-de-board/model/child';
import { SCREEN_SECTIONS } from '~/framework/modules/widgets/carnet-de-board/model/screen-sections';
import { pronoteRouteNames } from '~/framework/modules/widgets/carnet-de-board/navigation';
import redirect from '~/framework/modules/widgets/carnet-de-board/service/redirect';
import { navBarOptions } from '~/framework/navigation/navBar';

import styles from './styles';
import { CarnetDeBordScreenProps } from './types';

export const computeNavBar = ({ navigation, route }: CarnetDeBordScreenProps): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('carnetdebord'),
  }),
  headerLeft: () => <NavBarAction icon="ui-close" onPress={() => navigation.goBack()} testID="carnet-de-bord-close-button" />,
});

export const CarnetDeBordScreen = withSession<CarnetDeBordScreenProps>(({ navigation, session }) => {
  const { data, error, load } = useCarnetDeBord();
  const { select, selected, selectedId } = useSelectedChild<ICarnetDeBord>(data);

  const users = React.useMemo(
    () => data.map(child => ({ avatarId: child.id, id: getChildId(child), name: child.firstName })),
    [data],
  );

  // One child of the account may hold two Pronote accounts, in two structures: naming them is the
  // only way to tell the two entries apart.
  const structureName = React.useMemo(() => {
    if (data.filter(child => child.id === selected?.id).length < 2) return undefined;
    return session.user.structures?.find(structure => structure.id === selected?.structureId)?.name ?? ' ';
  }, [data, selected, session]);

  const openSection = React.useCallback(
    (section: CarnetDeBordSection) => {
      if (selected) navigation.navigate(pronoteRouteNames.carnetDeBordDetails, { data: selected, type: section });
    },
    [navigation, selected],
  );

  const openPronote = React.useCallback(() => {
    if (selected?.address) redirect(session, selected.address);
  }, [selected, session]);

  const renderContent = React.useCallback(
    (refreshControl: ScrollViewProps['refreshControl']) => (
      <ScrollView refreshControl={refreshControl}>
        {users.length > 1 ? (
          <UserList horizontal data={users} style={styles.users} selectedId={selectedId} onSelect={select} bottomInset={false} />
        ) : null}
        {structureName ? <SmallBoldText style={styles.structure}>{structureName}</SmallBoldText> : null}
        {hasPronoteData(selected) ? (
          <View style={styles.sections}>
            {SCREEN_SECTIONS.map(section => (
              <CarnetDeBordSectionCard
                key={section.section}
                emptyText={I18n.get(section.emptyText)}
                labels={section.getLabels(selected)}
                onPress={openSection}
                section={section.section}
                title={I18n.get(section.title)}
              />
            ))}
            <SecondaryButton
              style={styles.button}
              action={openPronote}
              iconRight="pictos-external-link"
              text={I18n.get('pronote-openinpronote')}
            />
          </View>
        ) : (
          <EmptyScreen
            svgImage="empty-timeline"
            title={I18n.get('pronote-nodatachild-title')}
            text={I18n.get('pronote-nodatachild-text')}
          />
        )}
      </ScrollView>
    ),
    [openPronote, openSection, select, selected, selectedId, structureName, users],
  );

  const renderError = React.useCallback(
    (refreshControl: ScrollViewProps['refreshControl']) => (
      <ScrollView refreshControl={refreshControl}>
        {error instanceof PronoteCdbInitError ? (
          <EmptyScreen
            svgImage="empty-pronote-uri"
            title={I18n.get('pronote-initfailed-title')}
            text={I18n.get('pronote-initfailed-text')}
          />
        ) : (
          <EmptyScreen svgImage="empty-light" title={I18n.get('pronote-nodata-title')} text={I18n.get('pronote-nodata-text')} />
        )}
      </ScrollView>
    ),
    [error],
  );

  return (
    <PageView>
      <ContentLoader renderError={renderError} loadContent={load} renderContent={renderContent} />
    </PageView>
  );
});

export default CarnetDeBordScreen;
