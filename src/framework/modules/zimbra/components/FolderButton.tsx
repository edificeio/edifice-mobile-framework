import { DrawerItem } from '@react-navigation/drawer';
import * as React from 'react';
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';

import theme from '~/app/theme';
import { UI_STYLES } from '~/framework/components/constants';
import { Picture } from '~/framework/components/picture';
import { IFolder } from '~/framework/modules/zimbra/model';

const styles = StyleSheet.create({
  expandActionContainer: {
    ...UI_STYLES.clickZone,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 2,
  },
});

interface FolderButtonProps {
  folder: IFolder;
  selectedFolderId?: string | null;
  selectedFolderPath?: string;
  onPress: (folder: IFolder) => void;
}

export const FolderButton = (props: FolderButtonProps) => {
  const [isExpanded, setExpanded] = React.useState<boolean>(false);
  const { folder } = props;
  const isSelected = folder.id === props.selectedFolderId || folder.path === props.selectedFolderPath;

  return (
    <>
      <DrawerItem
        label={folder.name}
        onPress={() => props.onPress(folder)}
        focused={isSelected}
        activeTintColor={theme.palette.primary.regular.toString()}
        activeBackgroundColor={theme.palette.primary.pale.toString()}
        inactiveTintColor={theme.ui.text.regular.toString()}
      />
      {folder.folders.length ? (
        <TouchableOpacity onPress={() => setExpanded(!isExpanded)} style={styles.expandActionContainer}>
          <Picture
            type="NamedSvg"
            name={isExpanded ? 'ui-rafterUp' : 'ui-rafterDown'}
            width={18}
            height={18}
            fill={isSelected ? theme.palette.primary.regular : theme.ui.text.regular}
          />
        </TouchableOpacity>
      ) : null}
      {isExpanded ? (
        <FlatList
          data={folder.folders}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <FolderButton {...props} folder={item} />}
        />
      ) : null}
    </>
  );
};
