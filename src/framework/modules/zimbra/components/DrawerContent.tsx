import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import I18n from 'i18n-js';
import * as React from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import { ModalBoxHandle } from '~/framework/components/ModalBox';
import { UI_SIZES } from '~/framework/components/constants';
import { Picture } from '~/framework/components/picture';
import { CaptionBoldText, HeadingXSText } from '~/framework/components/text';
import { ISession } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
import { fetchZimbraQuotaAction, fetchZimbraRootFoldersAction } from '~/framework/modules/zimbra/actions';
import { DefaultFolder, IFolder, IQuota } from '~/framework/modules/zimbra/model';
import moduleConfig from '~/framework/modules/zimbra/module-config';
import { getFolderName } from '~/framework/modules/zimbra/utils/folderName';
import { tryAction } from '~/framework/util/redux/actions';

import CreateFolderModal from './modals/CreateFolderModal';

const styles = StyleSheet.create({
  categoryText: {
    marginLeft: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.minor,
    color: theme.palette.primary.regular,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  foldersHeaderContainer: {
    flexDirection: 'row',
  },
  createFolderContainer: {
    flex: 1,
    flexDirection: 'row',
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingRight: UI_SIZES.spacing.small,
  },
  storageBar: {
    height: 30,
    marginHorizontal: UI_SIZES.spacing.small,
    marginBottom: UI_SIZES.spacing.small,
    backgroundColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.medium,
    overflow: 'hidden',
  },
  storageBarUsed: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    backgroundColor: theme.palette.grey.graphite,
  },
  storageText: {
    color: theme.ui.text.inverse,
  },
});

interface CustomDrawerContentProps extends DrawerContentComponentProps {
  folders: IFolder[];
  quota: IQuota;
  session?: ISession;
  fetchQuota: () => Promise<IQuota>;
  fetchRootFolders: () => Promise<IFolder[]>;
}

const DrawerContent = (props: CustomDrawerContentProps) => {
  const [selectedFolder, setSelectedFolder] = React.useState<string>('/Inbox');
  const modalBoxRef = React.useRef<ModalBoxHandle>(null);
  const defaultFolders = [
    { name: DefaultFolder.INBOX, path: '/Inbox' },
    { name: DefaultFolder.SENT, path: '/Sent' },
    { name: DefaultFolder.DRAFTS, path: '/Drafts' },
    { name: DefaultFolder.TRASH, path: '/Trash' },
    { name: DefaultFolder.JUNK, path: '/Junk' },
  ];

  React.useEffect(() => {
    props.fetchQuota();
    props.fetchRootFolders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeFolder = (name: string, path: string) => {
    if (path !== selectedFolder) {
      const { navigation } = props;

      setSelectedFolder(path);
      navigation.setParams({ folderName: name, folderPath: path });
      navigation.closeDrawer();
    }
  };

  const openFolderCreationModal = () => {
    props.navigation.closeDrawer();
    modalBoxRef.current?.doShowModal();
  };

  const refreshDrawer = () => {
    props.fetchRootFolders();
    modalBoxRef.current?.doDismissModal();
    props.navigation.openDrawer();
  };

  const renderStorage = () => {
    let { quota, storage } = props.quota;
    let unit = 'Mo';
    let storagePercent = 25;

    storage = Math.round(storage / (1024 * 1024));
    if (quota > 0) {
      quota = Math.round(quota / (1024 * 1024));
      if (quota > 2000) {
        quota = Math.round((quota / 1024) * 10) / 10;
        storage = Math.round((storage / 1024) * 10) / 10;
        unit = 'Go';
      }
      storagePercent = Math.max((storage / quota) * 100, 25);
    }

    return (
      <View>
        <HeadingXSText style={styles.categoryText}>{I18n.t('zimbra-storage')}</HeadingXSText>
        <View style={styles.storageBar}>
          <View style={[styles.storageBarUsed, { width: `${storagePercent}%` }]}>
            <CaptionBoldText style={styles.storageText}>
              {storage} {unit}
            </CaptionBoldText>
          </View>
        </View>
      </View>
    );
  };

  return (
    <>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.contentContainer}>
        <View>
          <HeadingXSText style={styles.categoryText}>{I18n.t('zimbra-messages')}</HeadingXSText>
          <FlatList
            data={defaultFolders}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <DrawerItem
                label={getFolderName(item.name)}
                onPress={() => changeFolder(item.name, item.path)}
                focused={item.path === selectedFolder}
                activeTintColor={theme.palette.primary.regular.toString()}
                activeBackgroundColor={theme.palette.primary.pale.toString()}
                inactiveTintColor={theme.ui.text.regular.toString()}
              />
            )}
          />
          <View style={styles.foldersHeaderContainer}>
            <HeadingXSText style={styles.categoryText}>{I18n.t('zimbra-directories')}</HeadingXSText>
            <TouchableOpacity onPress={openFolderCreationModal} style={styles.createFolderContainer}>
              <Picture type="NamedSvg" name="ui-plus" width={24} height={24} fill={theme.palette.primary.regular} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={props.folders}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <DrawerItem
                label={item.name}
                onPress={() => changeFolder(item.name, item.path)}
                focused={item.path === selectedFolder}
                activeTintColor={theme.palette.primary.regular.toString()}
                activeBackgroundColor={theme.palette.primary.pale.toString()}
                inactiveTintColor={theme.ui.text.regular.toString()}
              />
            )}
          />
        </View>
        {renderStorage()}
      </DrawerContentScrollView>
      <CreateFolderModal ref={modalBoxRef} session={props.session} creationCallback={refreshDrawer} />
    </>
  );
};

export default connect(
  (state: IGlobalState) => {
    const zimbraState = moduleConfig.getState(state);
    const session = getSession();
    const inboxFolder = zimbraState.rootFolders.data.find(folder => folder.name === 'Inbox');

    return {
      folders: inboxFolder?.folders ?? [],
      quota: zimbraState.quota.data,
      session,
    };
  },
  (dispatch: ThunkDispatch<any, any, any>) =>
    bindActionCreators(
      {
        fetchQuota: tryAction(fetchZimbraQuotaAction, undefined, true) as unknown as CustomDrawerContentProps['fetchQuota'],
        fetchRootFolders: tryAction(
          fetchZimbraRootFoldersAction,
          undefined,
          true,
        ) as unknown as CustomDrawerContentProps['fetchRootFolders'],
      },
      dispatch,
    ),
)(DrawerContent);
