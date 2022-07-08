import I18n from 'i18n-js';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { Text, TextSizeStyle } from '~/framework/components/text';
import { IEventProps } from '~/modules/workspace/types';
import { renderIcon } from '~/modules/workspace/components/image';
import { CommonStyles } from '~/styles/common/styles';
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
    color: CommonStyles.lightTextColor,
    maxWidth: '50%',
  },
});

export const WorkspaceFileListItem = ({ item, isSelected, onPressCallback, onLongPressCallback }: IEventProps & any) => {
  const { id, isFolder, name, date, ownerName = '', contentType } = item;
  const longOwnerName = `${I18n.t('common.by').toLowerCase()} ${ownerName}`;

  return (
    <ListItem
      onPress={() => onPressCallback(item)}
      onLongPress={() => onLongPressCallback(item)}
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
