import I18n from 'i18n-js';
import * as React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Text, TextSizeStyle } from '~/framework/components/text';
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
    marginTop: UI_SIZES.spacing.tiny,
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
