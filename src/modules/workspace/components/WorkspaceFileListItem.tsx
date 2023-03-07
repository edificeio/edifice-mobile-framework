import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { ListItem } from '~/framework/components/listItem';
import { CaptionText, SmallText } from '~/framework/components/text';
import { displayPastDate } from '~/framework/util/date';
import { renderIcon } from '~/modules/workspace/components/image';
import { Filter, IFile } from '~/modules/workspace/reducer';

const styles = StyleSheet.create({
  centerPanel: {
    flex: 1,
    marginLeft: UI_SIZES.spacing.small,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: UI_SIZES.spacing.tiny,
  },
  captionText: {
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
    const { id, isFolder, name, date, ownerName, contentType, parentId } = item;
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
