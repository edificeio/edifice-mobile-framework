import I18n from 'i18n-js';
import * as React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

import { Text, NestedText } from '~/framework/components/text';
import { layoutSize } from '~/styles/common/layoutSize';
import { CommonStyles } from '~/styles/common/styles';
import { CenterPanel, LeftIconPanel, ListItem } from '~/ui/ContainerContent';
import { DateView } from '~/ui/DateView';
import { IEventProps, EVENT_TYPE } from '~/workspace/types';
import { renderIcon } from '~/workspace/utils/image';

const style = StyleSheet.create({
  centerPanel: {
    alignItems: 'stretch',
    justifyContent: 'space-around',
  },
  fileName: {
    color: CommonStyles.shadowColor,
    fontSize: layoutSize.LAYOUT_15,
  },
  fileNameSimple: {
    color: CommonStyles.shadowColor,
    fontSize: layoutSize.LAYOUT_14,
  },
  date: { flex: 1, alignItems: 'flex-start' },
  author: { flex: 3, alignItems: 'flex-end' },
});

export const Item = ({ onEvent, item, selected, multiSelect }: IEventProps & any) => {
  const { id, isFolder, name, date, ownerName = '', contentType } = item;
  const longOwnerName = `${I18n.t('common.by').toLowerCase()} ${ownerName}`;

  return (
    <ListItem
      onLongPress={() => onEvent({ type: EVENT_TYPE.LONG_SELECT, id: item.id, item })}
      onPress={() => {
        const previewEvent = { type: EVENT_TYPE.PREVIEW, item };
        const selectEvent = { type: EVENT_TYPE.SELECT, id: item.id, item };
        const eventInfos = Platform.select({
          ios: isFolder || multiSelect ? selectEvent : previewEvent,
          default: selectEvent,
        });
        onEvent(eventInfos);
      }}
      style={{ backgroundColor: selected ? '#2A9CC825' : '#fff', margin: 0 }}
      borderBottomWidth={0}>
      <LeftIconPanel>{renderIcon(id, isFolder, name, contentType)}</LeftIconPanel>
      <CenterPanel style={style.centerPanel}>
        <Text numberOfLines={1} style={style.fileName}>
          {name}
        </Text>
        <View style={{ flexDirection: 'row' }}>
          {!!date && (
            <View style={style.date}>
              <DateView min date={date} />
            </View>
          )}
          {ownerName.length > 0 && (
            <View style={style.author}>
              <NestedText
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{
                  fontSize: layoutSize.LAYOUT_10,
                  color: CommonStyles.lightTextColor,
                }}>
                {longOwnerName}
              </NestedText>
            </View>
          )}
        </View>
      </CenterPanel>
    </ListItem>
  );
};
