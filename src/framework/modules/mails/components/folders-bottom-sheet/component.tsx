import React from 'react';
import { View } from 'react-native';

import { FlatList, ScrollView } from 'react-native-gesture-handler';

import MailsFolderItem from '../folder-item';
import styles from './styles';
import { MailsFoldersBottomSheetProps } from './types';

import { I18n } from '~/app/i18n';
import PrimaryButton from '~/framework/components/buttons/primary';
import { getScaleWidth } from '~/framework/components/constants';
import HeaderBottomSheetModal from '~/framework/components/modals/bottom-sheet/header';
import { Svg } from '~/framework/components/picture';
import { BodyText } from '~/framework/components/text';
import stylesFolders from '~/framework/modules/mails/components/folder-item/styles';

const EMPTY_SVG_SIZE = getScaleWidth(150);

const MailsFoldersBottomSheet = (props: MailsFoldersBottomSheetProps) => {
  return (
    <ScrollView
      keyboardDismissMode="none"
      keyboardShouldPersistTaps="always"
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
      bounces={false}>
      <View style={styles.contentBottomSheet}>
        <HeaderBottomSheetModal
          title={props.title}
          iconRight="ui-check"
          iconRightDisabled={props.disabledAction}
          onPressRight={props.action}
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
              selected={props.newParentFolderId === item.id}
              disabled={item.id === props.mailFolderId}
              onPress={() => props.onPressFolder(item)}
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

export default MailsFoldersBottomSheet;
