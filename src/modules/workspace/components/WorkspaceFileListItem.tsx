import I18n from 'i18n-js';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { Text, TextSizeStyle } from '~/framework/components/text';
import { renderIcon } from '~/modules/workspace/components/image';
import { IFile } from '~/modules/workspace/reducer';
import { CenterPanel, LeftIconPanel, ListItem } from '~/ui/ContainerContent';
import { DateView } from '~/ui/DateView';

const style = StyleSheet.create({
  centerPanel: {
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  dateText: {
    maxWidth: '50%',
  },
  authorText: {
    ...TextSizeStyle.Small,
    color: theme.legacy.neutral.subtleLight,
    maxWidth: '50%',
  },
});

interface IWorkspaceFileListItemProps {
  item: IFile;
  disabled?: boolean;
  isSelected?: boolean;
  onLongPress: (file: IFile) => void;
  onPress: (file: IFile) => void;
}

export const WorkspaceFileListItem = ({ item, disabled, isSelected, onLongPress, onPress }: IWorkspaceFileListItemProps) => {
  const { id, isFolder, name, date, ownerName = '', contentType } = item;
  const longOwnerName = `${I18n.t('common.by').toLowerCase()} ${ownerName}`;
  const onPressCallback = () => onPress(item);
  const onLongPressCallback = () => {
    if (item.parentId !== 'root') {
      onLongPress(item);
    }
  };

  return (
    <ListItem
      onPress={onPressCallback}
      onLongPress={onLongPressCallback}
      disabled={disabled}
      style={{ backgroundColor: isSelected ? theme.palette.primary.pale : theme.ui.background.card }}
      borderBottomWidth={0}>
      <LeftIconPanel>{renderIcon(id, isFolder, name, contentType)}</LeftIconPanel>
      <CenterPanel style={style.centerPanel}>
        <Text numberOfLines={1}>{name}</Text>
        <View style={style.dateContainer}>
          {date ? (
            <View style={style.dateText}>
              <DateView min date={date} />
            </View>
          ) : null}
          {ownerName.length > 0 ? (
            <Text numberOfLines={1} style={style.authorText}>
              {longOwnerName}
            </Text>
          ) : null}
        </View>
      </CenterPanel>
    </ListItem>
  );
};
