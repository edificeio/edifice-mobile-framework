import * as React from 'react';
import { ScrollView, ScrollViewProps, View } from 'react-native';

import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

import { I18n } from '~/app/i18n';
import { EmptyScreen } from '~/framework/components/empty-screens';
import { NavBarAction } from '~/framework/components/navigation';
import { PageView } from '~/framework/components/page';
import { SmallBoldText } from '~/framework/components/text';
import UserList from '~/framework/components/UserList';
import { ContentLoader, LoadingState } from '~/framework/hooks/loader';
import { withSession } from '~/framework/modules/auth/util';
import { CarnetDeBordPronoteButton } from '~/framework/modules/widgets/carnet-de-board/components/pronote-button';
import { CarnetDeBordSectionCard } from '~/framework/modules/widgets/carnet-de-board/components/section-card';
import { CarnetDeBordSectionPlaceholder } from '~/framework/modules/widgets/carnet-de-board/components/section-placeholder';
import { useCarnetDeBord } from '~/framework/modules/widgets/carnet-de-board/hooks';
import {
  CarnetDeBordSection,
  hasPronoteData,
  PronoteCdbInitError,
  SCREEN_SECTIONS,
} from '~/framework/modules/widgets/carnet-de-board/model';
import { pronoteRouteNames } from '~/framework/modules/widgets/carnet-de-board/navigation';
import { getChildId } from '~/framework/modules/widgets/model';
import { navBarOptions } from '~/framework/navigation/navBar';
import { openUrl } from '~/framework/util/linking';

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
  const { data, error, load, select, selected } = useCarnetDeBord();

  // The home page has just loaded this data, so the screen shows it at once instead of a spinner.
  // Frozen on mount: the loader only ever reads this state when it initialises.
  const hadData = React.useRef(data.length > 0).current;

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

  const renderContent = React.useCallback(
    (refreshControl: ScrollViewProps['refreshControl']) => (
      <ScrollView refreshControl={refreshControl}>
        {users.length > 1 ? (
          <UserList
            horizontal
            data={users}
            style={styles.users}
            selectedId={selected && getChildId(selected)}
            onSelect={select}
            bottomInset={false}
          />
        ) : null}
        {structureName ? <SmallBoldText style={styles.structure}>{structureName}</SmallBoldText> : null}
        {hasPronoteData(selected) ? (
          <View style={styles.sections}>
            {SCREEN_SECTIONS.map(section => (
              <CarnetDeBordSectionCard
                key={section.section}
                emptyText={I18n.get(section.emptyTextI18n)}
                labels={section.getLabels(selected)}
                onPress={openSection}
                section={section.section}
                title={I18n.get(section.titleI18n)}
              />
            ))}
            <CarnetDeBordPronoteButton address={selected.address} session={session} />
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
    [openSection, select, selected, session, structureName, users],
  );

  const renderLoading = React.useCallback(() => <CarnetDeBordSectionPlaceholder style={styles.sections} />, []);

  const pronoteConnectorsSorted = React.useMemo(() => {
    const connectors = session?.rights.apps.filter(app => app.casType === 'PronoteRegisteredService');
    connectors?.sort((a, b) => String(a.displayName ?? a.name).localeCompare(String(b.displayName ?? b.name)));
    return connectors;
  }, [session?.rights.apps]);

  const openAddress = React.useMemo(() => {
    const connector = pronoteConnectorsSorted?.[0];
    const finalUrl = connector ? `/auth/redirect?url=${encodeURIComponent(connector.address.trim())}` : undefined;
    return finalUrl;
  }, [pronoteConnectorsSorted]);

  const renderError = React.useCallback(
    (refreshControl: ScrollViewProps['refreshControl']) => (
      <ScrollView refreshControl={refreshControl}>
        {error instanceof PronoteCdbInitError ? (
          <EmptyScreen
            svgImage="empty-pronote-uri"
            title={I18n.get('pronote-initfailed-title')}
            text={I18n.get('pronote-initfailed-text')}
            buttonAction={() => {
              openAddress && openUrl(openAddress);
            }}
            buttonIcon="ui-external-link"
            buttonText={I18n.get('pronote-carnet-de-bord-error-redirect')}
          />
        ) : (
          <EmptyScreen svgImage="empty-light" title={I18n.get('pronote-nodata-title')} text={I18n.get('pronote-nodata-text')} />
        )}
      </ScrollView>
    ),
    [error, openAddress],
  );

  return (
    <PageView>
      <ContentLoader
        initialLoadingState={hadData ? LoadingState.DONE : undefined}
        renderLoading={renderLoading}
        renderError={renderError}
        loadContent={load}
        renderContent={renderContent}
      />
    </PageView>
  );
});

export default CarnetDeBordScreen;
