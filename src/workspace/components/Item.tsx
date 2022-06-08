import I18n from 'i18n-js';
import * as React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { Text, TextSizeStyle } from '~/framework/components/text';
import { CommonStyles } from '~/styles/common/styles';
import { CenterPanel, LeftIconPanel, ListItem } from '~/ui/ContainerContent';
import { DateView } from '~/ui/DateView';
import { EVENT_TYPE, IEventProps } from '~/workspace/types';
import { renderIcon } from '~/workspace/utils/image';

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
    width: '50%',
  },
  authorText: {
    ...TextSizeStyle.Small,
    color: CommonStyles.lightTextColor,
    width: '50%',
  }
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
      style={{ backgroundColor: selected ? theme.palette.primary.pale : theme.ui.background.card }}
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
