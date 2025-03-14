import * as React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import moment from 'moment';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { ListItem } from '~/framework/components/listItem';
import { CaptionText, SmallText } from '~/framework/components/text';
import { renderIcon } from '~/framework/modules/workspace/components/image';
import { Filter, IFile } from '~/framework/modules/workspace/reducer';
import { displayPastDate } from '~/framework/util/date';

const styles = StyleSheet.create({
  captionText: {
    color: theme.ui.text.light,
    maxWidth: '50%',
  },
  centerPanel: {
    flex: 1,
    marginLeft: UI_SIZES.spacing.small,
  },
  dateContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: UI_SIZES.spacing.tiny,
  },
});

interface IWorkspaceFileListItemProps {
  item: IFile;
  isDisabled?: boolean;
  isSelected?: boolean;
  onLongPress?: (file: IFile) => void;
  onPress?: (file: IFile) => void;
}

export class WorkspaceFileListItem extends React.PureComponent<IWorkspaceFileListItemProps> {
  onPressCallback = () => {
    const { item, onPress } = this.props;
    if (onPress) onPress(item);
  };

  onLongPressCallback = () => {
    const { item, onLongPress } = this.props;
    if (item.parentId !== 'root') {
      if (onLongPress) onLongPress(item);
    }
  };

  public render() {
    const { isDisabled, isSelected, item } = this.props;
    const { contentType, date, id, isFolder, name, ownerName, parentId } = item;
    const borderBottomWidth = isDisabled ? 0 : 1;
    const longOwnerName = `${I18n.get('common-by').toLowerCase()} ${ownerName}`;
    return (
      <TouchableOpacity onPress={this.onPressCallback} onLongPress={this.onLongPressCallback} disabled={isDisabled}>
        <ListItem
          style={{ backgroundColor: isSelected ? theme.palette.primary.pale : theme.ui.background.card, borderBottomWidth }}
          leftElement={renderIcon(id, isFolder, name, contentType)}
          rightElement={
            <View style={styles.centerPanel}>
              <SmallText numberOfLines={1}>{name}</SmallText>
              {parentId !== Filter.ROOT ? (
                <View style={styles.dateContainer}>
                  <CaptionText numberOfLines={1} style={styles.captionText}>
                    {displayPastDate(moment(date))}
                  </CaptionText>
                  <CaptionText numberOfLines={1} style={styles.captionText}>
                    {longOwnerName}
                  </CaptionText>
                </View>
              ) : null}
            </View>
          }
        />
      </TouchableOpacity>
    );
  }
}
