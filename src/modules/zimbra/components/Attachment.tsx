import * as React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Icon } from '~/framework/components/picture/Icon';
import { SmallText } from '~/framework/components/text';
import { getFileIcon } from '~/modules/zimbra/utils/fileIcon';

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.palette.primary.pale,
  },
  leftContainer: {
    width: 48,
    alignItems: 'center',
  },
  nameText: {
    color: theme.palette.primary.regular,
    flexShrink: 1,
    marginVertical: UI_SIZES.spacing.tiny,
  },
  iconMargin: {
    marginHorizontal: UI_SIZES.spacing.small,
    marginVertical: UI_SIZES.spacing.minor,
  },
});

interface IAttachmentProps {
  name: string;
  type: string;
  uploadSuccess: boolean;
  onRemove: () => void;
}

export const Attachment = ({ name, type, uploadSuccess, onRemove }: IAttachmentProps) => {
  const iconName = getFileIcon(type);
  return (
    <TouchableOpacity style={styles.mainContainer} onPress={onRemove}>
      <View style={styles.leftContainer}>
        {uploadSuccess ? (
          <Icon name={iconName} size={25} color={theme.palette.primary.regular} />
        ) : (
          <ActivityIndicator color={theme.palette.primary.regular} />
        )}
      </View>
      <SmallText numberOfLines={2} style={styles.nameText}>
        {name}
      </SmallText>
      <Icon name="close" size={14} color={theme.palette.complementary.red.regular} style={styles.iconMargin} />
    </TouchableOpacity>
  );
};
