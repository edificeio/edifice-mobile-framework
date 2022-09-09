import I18n from 'i18n-js';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { CaptionText, SmallText } from '~/framework/components/text';
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
    color: theme.ui.text.light,
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

export class WorkspaceFileListItem extends React.PureComponent<IWorkspaceFileListItemProps> {
  onPressCallback = () => {
    const { item, onPress } = this.props;
    onPress(item);
  };

  onLongPressCallback = () => {
    const { item, onLongPress } = this.props;
    if (item.parentId !== 'root') {
      onLongPress(item);
    }
  };

  public render() {
    const { item, disabled, isSelected } = this.props;
    const { id, isFolder, name, date, ownerName = '', contentType } = item;
    const longOwnerName = `${I18n.t('common.by').toLowerCase()} ${ownerName}`;
    return (
      <ListItem
        onPress={this.onPressCallback}
        onLongPress={this.onLongPressCallback}
        disabled={disabled}
        style={{ backgroundColor: isSelected ? theme.palette.primary.pale : theme.ui.background.card }}
        borderBottomWidth={0}>
        <LeftIconPanel>{renderIcon(id, isFolder, name, contentType)}</LeftIconPanel>
        <CenterPanel style={style.centerPanel}>
          <SmallText numberOfLines={1}>{name}</SmallText>
          <View style={style.dateContainer}>
            {date ? (
              <View style={style.dateText}>
                <DateView min date={date} />
              </View>
            ) : null}
            {ownerName.length > 0 ? (
              <CaptionText numberOfLines={1} style={style.authorText}>
                {longOwnerName}
              </CaptionText>
            ) : null}
          </View>
        </CenterPanel>
      </ListItem>
    );
  }
}
