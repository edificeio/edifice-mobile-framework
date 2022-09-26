import I18n from 'i18n-js';
import * as React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { ListItem } from '~/framework/components/listItem';
import { CaptionText, SmallText } from '~/framework/components/text';
import { renderIcon } from '~/modules/workspace/components/image';
import { IFile } from '~/modules/workspace/reducer';
import { DateView } from '~/ui/DateView';

const styles = StyleSheet.create({
  centerPanel: {
    flex: 1,
    marginLeft: UI_SIZES.spacing.small,
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
  isDisabled?: boolean;
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
    const { item, isDisabled, isSelected } = this.props;
    const { id, isFolder, name, date, ownerName = '', contentType } = item;
    const borderBottomWidth = isDisabled ? 0 : 1;
    const longOwnerName = `${I18n.t('common.by').toLowerCase()} ${ownerName}`;
    return (
      <TouchableOpacity onPress={this.onPressCallback} onLongPress={this.onLongPressCallback} disabled={isDisabled}>
        <ListItem
          style={{ backgroundColor: isSelected ? theme.palette.primary.pale : theme.ui.background.card, borderBottomWidth }}
          leftElement={renderIcon(id, isFolder, name, contentType)}
          rightElement={
            <View style={styles.centerPanel}>
              <SmallText numberOfLines={1}>{name}</SmallText>
              <View style={styles.dateContainer}>
                {date ? (
                  <View style={styles.dateText}>
                    <DateView min date={date} />
                  </View>
                ) : null}
                {ownerName.length > 0 ? (
                  <CaptionText numberOfLines={1} style={styles.authorText}>
                    {longOwnerName}
                  </CaptionText>
                ) : null}
              </View>
            </View>
          }
        />
      </TouchableOpacity>
    );
  }
}
