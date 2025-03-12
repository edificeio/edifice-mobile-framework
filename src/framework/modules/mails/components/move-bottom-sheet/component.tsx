import React from 'react';
import { View } from 'react-native';

import { FlatList, ScrollView } from 'react-native-gesture-handler';

import MailsFolderItem from '../folder-item';
import styles from './styles';
import { MailsMoveBottomSheetProps } from './types';

import { I18n } from '~/app/i18n';
import PrimaryButton from '~/framework/components/buttons/primary';
import { getScaleWidth } from '~/framework/components/constants';
import HeaderBottomSheetModal from '~/framework/components/modals/bottom-sheet/header';
import { Svg } from '~/framework/components/picture';
import { BodyText } from '~/framework/components/text';
import stylesFolders from '~/framework/modules/mails/components/folder-item/styles';
import { MailsFolderInfo } from '~/framework/modules/mails/model';

const EMPTY_SVG_SIZE = getScaleWidth(150);

const MailsMoveBottomSheet = (props: MailsMoveBottomSheetProps) => {
  const [selectedFolder, setSelectedFolder] = React.useState<MailsFolderInfo>();

  return (
    <ScrollView
      keyboardDismissMode="none"
      keyboardShouldPersistTaps="always"
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
      bounces={false}>
      <View style={styles.contentBottomSheet}>
        <HeaderBottomSheetModal
          title={I18n.get('mails-details-move')}
          iconRight="ui-check"
          iconRightDisabled={!selectedFolder}
          onPressRight={() => props.onMove(selectedFolder!.id)}
        />
        <FlatList
          data={props.folders}
          contentContainerStyle={[
            stylesFolders.containerFolders,
            styles.flatListBottomSheet,
            props.folders?.length === 0 ? styles.nofoldersContainer : {},
          ]}
          renderItem={({ item }) => (
            <MailsFolderItem
              key={item.id}
              icon="ui-folder"
              name={item.name}
              depth={item.depth}
              selected={selectedFolder?.id === item.id}
              disabled={item.id === props.mailFolderId}
              onPress={() => setSelectedFolder(item)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.nofolders}>
              <Svg name="empty-nofolders" width={EMPTY_SVG_SIZE} height={EMPTY_SVG_SIZE} />
              <BodyText>{I18n.get('mails-details-nofolders')}</BodyText>
              <PrimaryButton text={I18n.get('mails-details-createfolder')} action={props.onPressCreateFolderButton} />
            </View>
          }
        />
      </View>
    </ScrollView>
  );
};

export default MailsMoveBottomSheet;
