import I18n from 'i18n-js';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { NavigationDrawerProp } from 'react-navigation-drawer';

import theme from '~/app/theme';
import { Icon } from '~/framework/components/picture/Icon';
import { Text, TextSizeStyle } from '~/framework/components/text';
import CreateFolderModal from '~/modules/zimbra/components/Modals/CreateFolderModal';
import { IFolder, IQuota } from '~/modules/zimbra/state/initMails';
import { IRootFolderList } from '~/modules/zimbra/state/rootFolders';
import { PageContainer } from '~/ui/ContainerContent';

import DrawerOption from './DrawerOption';

const styles = StyleSheet.create({
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8, // MO-142 use UI_SIZES.spacing here
    backgroundColor: theme.palette.primary.pale,
  },
  labelText: {
    ...TextSizeStyle.SlightBig,
    marginLeft: 12, // MO-142 use UI_SIZES.spacing here
  },
  container: {
    backgroundColor: theme.palette.grey.white,
  },
  folderCreationButton: {
    paddingLeft: 12, // MO-142 use UI_SIZES.spacing here
    marginBottom: 2, // MO-142 use UI_SIZES.spacing here
  },
  loadBar: {
    backgroundColor: theme.palette.grey.cloudy,
    width: '100%',
    height: 20,
  },
  loadBarPercent: {
    backgroundColor: theme.palette.grey.black,
    height: '100%',
  },
  loadBarText: {
    textAlign: 'center',
    color: theme.palette.grey.white,
  },
  drawerBottom: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
});

type DrawerMenuProps = {
  activeItemKey: string;
  items: any[];
  folders: IRootFolderList;
  quota: IQuota;
  descriptors: any[];
  navigation: NavigationDrawerProp<any>;
};

type DrawerMenuState = {
  showFolderCreationModal: boolean;
};

export default class DrawerMenu extends React.PureComponent<DrawerMenuProps, DrawerMenuState> {
  constructor(props) {
    super(props);
    this.state = {
      showFolderCreationModal: false,
    };
  }

  onFolderCreationModalShow = () => {
    this.setState({
      showFolderCreationModal: true,
    });
  };

  onFolderCreationModalClose = () => {
    this.setState({
      showFolderCreationModal: false,
    });
  };

  isCurrentScreen = key => {
    return !this.getCurrentFolder(this.props.navigation.state) && this.props.activeItemKey === key;
  };

  getCurrentFolder = state => {
    if (this.props.activeItemKey !== 'folder' || !state.routes) return undefined;
    const folderState = state.routes.find(r => r.key === 'folder');
    if (folderState.params === undefined) return undefined;
    return folderState.params.folderName;
  };

  findFolder = (folderName: string) => {
    if (this.props.folders && this.props.folders.length > 0) {
      const folderInfos = this.props.folders.find(item => item.folderName === folderName);
      if (folderInfos !== undefined) return folderInfos;
    }
    return { id: '', folderName: '', path: '', unread: 0, count: 0, folders: [] };
  };

  renderStorage = () => {
    let quota = 0 as number;
    let storage = 0 as number;
    let unit = 'Mo' as string;
    let storagePercent = 20 as number;
    if (Number(this.props.quota.quota) > 0) {
      quota = Number(this.props.quota.quota) / (1024 * 1024);
      storage = this.props.quota.storage / (1024 * 1024);

      if (quota > 2000) {
        quota = Math.round((quota / 1024) * 10) / 10;
        storage = Math.round((storage / 1024) * 10) / 10;
        unit = 'Go';
      } else {
        quota = Math.round(quota);
        storage = Math.round(storage);
      }
      storagePercent = (storage / quota) * 100;
    } else {
      storage = Math.round(this.props.quota.storage / (1024 * 1024));
    }

    return (
      <View style={styles.loadBar}>
        <View style={[styles.loadBarPercent, { width: `${storagePercent}%` }]}>
          <Text style={styles.loadBarText}>
            {storage}&ensp;{unit}
          </Text>
        </View>
      </View>
    );
  };

  renderDrawerFolders = () => {
    const { navigation } = this.props;
    const currentFolder = this.getCurrentFolder(this.props.navigation.state);
    const inboxFolder: IFolder = this.findFolder('Inbox');
    return (
      <View>
        {inboxFolder !== undefined &&
          inboxFolder.folders !== undefined &&
          inboxFolder.folders.length > 0 &&
          inboxFolder.folders.map(folder => (
            <DrawerOption
              selected={folder.folderName === currentFolder}
              iconName="folder"
              label={folder.folderName}
              navigate={() => {
                navigation.navigate('folder', { key: folder.folderName, folderName: folder.folderName });
                navigation.closeDrawer();
              }}
              count={folder.unread}
            />
          ))}
      </View>
    );
  };

  renderDrawerMessages = () => {
    const { navigation } = this.props;
    return (
      <View>
        <DrawerOption
          selected={this.isCurrentScreen('inbox')}
          iconName="inbox"
          label={I18n.t('zimbra-inbox')}
          navigate={() => navigation.navigate('inbox', { key: 'inbox', folderName: undefined })}
          count={this.findFolder('Inbox').unread}
        />
        <DrawerOption
          selected={this.isCurrentScreen('sendMessages')}
          iconName="send"
          label={I18n.t('zimbra-outbox')}
          navigate={() => navigation.navigate('sendMessages', { key: 'sendMessages', folderName: undefined })}
        />
        <DrawerOption
          selected={this.isCurrentScreen('drafts')}
          iconName="insert_drive_file"
          label={I18n.t('zimbra-drafts')}
          navigate={() => navigation.navigate('drafts', { key: 'drafts', folderName: undefined })}
          count={this.findFolder('Drafts').count}
        />
        <DrawerOption
          selected={this.isCurrentScreen('trash')}
          iconName="delete"
          label={I18n.t('zimbra-trash')}
          navigate={() => navigation.navigate('trash', { key: 'trash', folderName: undefined })}
        />
        <DrawerOption
          selected={this.isCurrentScreen('spams')}
          iconName="delete_sweep"
          label={I18n.t('zimbra-spams')}
          navigate={() => navigation.navigate('spams', { key: 'spams', folderName: undefined })}
          count={this.findFolder('Junk').unread}
        />
      </View>
    );
  };

  render() {
    return (
      <PageContainer style={styles.container}>
        <ScrollView>
          <View style={styles.labelContainer}>
            <Text style={styles.labelText}>{I18n.t('zimbra-messages')}</Text>
          </View>
          {this.renderDrawerMessages()}
          <View style={styles.labelContainer}>
            <Text style={styles.labelText}>{I18n.t('zimbra-directories')}</Text>
          </View>
          {this.renderDrawerFolders()}
          <TouchableOpacity onPress={this.onFolderCreationModalShow} style={[styles.labelContainer, styles.folderCreationButton]}>
            <Icon size={22} name="create_new_folder" />
            <Text style={styles.labelText}>{I18n.t('zimbra-create-directory')}</Text>
          </TouchableOpacity>
        </ScrollView>
        <View style={styles.drawerBottom}>
          <View style={styles.labelContainer}>
            <Text style={styles.labelText}>{I18n.t('zimbra-storage')}</Text>
          </View>
          {this.renderStorage()}
        </View>
        <CreateFolderModal show={this.state.showFolderCreationModal} onClose={this.onFolderCreationModalClose} />
      </PageContainer>
    );
  }
}
