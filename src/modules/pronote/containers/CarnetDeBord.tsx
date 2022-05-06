import I18n from 'i18n-js';
import * as React from 'react';
import { ScrollView, ScrollViewProps } from 'react-native';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/AppStore';
import theme from '~/app/theme';
import { TouchableOverviewCard } from '~/framework/components/card';
import { PageView } from '~/framework/components/page';
import { Text } from '~/framework/components/text';
import { ContentLoader } from '~/framework/hooks/loader';
import { tryAction } from '~/framework/util/redux/actions';
import { IUserSession, UserType, getUserSession } from '~/framework/util/session';
import { getItemJson, setItemJson } from '~/framework/util/storage';

import UserList, { IUserListItem, UserListProps } from '../../../framework/components/UserList';
import moduleConfig from '../moduleConfig';
import { ICarnetDeBord } from '../state/carnetDeBord';
import { loadCarnetDeBordAction } from '../state/carnetDeBord/actions';
import { ICarnetDeBord_State_Data } from '../state/carnetDeBord/reducer';

export interface CarnetDeBordDataProps {
  session: IUserSession;
  data: ICarnetDeBord_State_Data;
}
export interface CarnetDeBordEventProps {
  handleLoadData: () => Promise<ICarnetDeBord[]>;
}
export type CarnetDeBordProps = CarnetDeBordDataProps & CarnetDeBordEventProps & NavigationInjectedProps;

function CarnetDeBord({ data, session, handleLoadData, navigation }: CarnetDeBordProps) {
  // UserList info & selected user
  const getUsers = React.useCallback(
    (_data: typeof data) => _data.map(cdb => ({ id: cdb.idPronote, avatarId: cdb.id, name: cdb.firstName })),
    [],
  );
  const users: UserListProps['data'] = React.useMemo(() => getUsers(data), [getUsers, data]);
  const [selectedId, setSelectedId] = React.useState<string | undefined>(undefined);
  const selectUser = React.useCallback(async (id: string | undefined, _users: NonNullable<UserListProps['data']>) => {
    // Prevent selecting a non-existing user. Fallback onto the first of the list.
    const idToBeSelected = _users.find(u => u.id === id) ? id : _users[0].id;
    if (!idToBeSelected) throw new Error(`idToBeSelected is undefined. CarnetDeBord need to select an existing user`);
    setSelectedId(idToBeSelected);
    setItemJson(CarnetDeBord.STORAGE_KEY, idToBeSelected);
  }, []);
  const isUserListShown = React.useMemo(() => session.user.type === UserType.Relative || users.length > 1, [session, users]);

  // Data & content
  const loadData = React.useCallback(async () => {
    const [newData, savedSelectedId] = await Promise.all([handleLoadData(), getItemJson<string>(CarnetDeBord.STORAGE_KEY)]);
    const newsUsers = getUsers(newData);
    selectUser(savedSelectedId, newsUsers);
  }, [selectUser, handleLoadData, getUsers]);
  const selectedCdbData = React.useMemo(() => {
    return data.find(d => d.idPronote === selectedId);
  }, [data, selectedId]);
  const isStructureShown = React.useMemo(() => {
    const dataOfUser = data.filter(d => d.id === selectedCdbData?.id);
    return dataOfUser.length > 1;
  }, [data, selectedCdbData]);
  const renderContent = React.useMemo(
    () => CarnetDeBord.getRenderContent(selectedCdbData!, users, selectedId, selectUser, isUserListShown, isStructureShown),
    [selectedCdbData, users, selectedId, selectUser, isUserListShown, isStructureShown],
  );

  return (
    <PageView
      navigation={navigation}
      navBarWithBack={{
        title: I18n.t(`CarnetDeBord`),
      }}>
      <ContentLoader loadContent={loadData} renderContent={renderContent} />
    </PageView>
  );
}
CarnetDeBord.getRenderContent =
  (
    data: ICarnetDeBord | undefined,
    users: Readonly<IUserListItem[]>,
    selectedId: string | undefined,
    setSelected: (id: string, users: NonNullable<UserListProps['data']>) => void,
    isUserListShown: boolean,
    isStructureShown: boolean,
  ) =>
  (refreshControl: ScrollViewProps['refreshControl']) => {
    return (
      <ScrollView refreshControl={refreshControl}>
        {isUserListShown ? (
          <UserList horizontal data={users} selectedId={selectedId} onSelect={usr => setSelected(usr, users)} bottomInset={false} />
        ) : null}
        {isStructureShown ? <Text>{}</Text> : null}
        {data ? (
          <>
            <Text>{data.idPronote}</Text>
            <Text>{data.id}</Text>
            <Text>{data.structureId}</Text>

            <TouchableOverviewCard
              picture={{
                type: 'NamedSvg',
                name: 'homework2D',
                color: theme.color.text.inverse,
              }}
              title={data.displayName}>
              <Text>{data.idPronote}</Text>
            </TouchableOverviewCard>
          </>
        ) : null}
      </ScrollView>
    );
  };
CarnetDeBord.STORAGE_KEY = `${moduleConfig.name}.CarnetDeBord.selectedUserId`;

export default connect(
  (state: IGlobalState) => {
    return { data: moduleConfig.getState(state).carnetDeBord.data, session: getUserSession() };
  },
  (dispatch: ThunkDispatch<any, any, any>) =>
    bindActionCreators(
      {
        handleLoadData: tryAction(loadCarnetDeBordAction, undefined, true) as unknown as () => Promise<ICarnetDeBord[]>, // Some TS issue with ThunkDispatch
      },
      dispatch,
    ),
)(CarnetDeBord);
