import * as React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES, UI_STYLES } from '~/framework/components/constants';
import { Picture } from '~/framework/components/picture';
import { Icon } from '~/framework/components/picture/Icon';
import { SmallText } from '~/framework/components/text';
import { getFileIcon } from '~/framework/modules/zimbra/utils/fileIcon';

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

interface IAttachmentProps {
  name?: string;
  type?: string;
  uploadSuccess?: boolean;
  onRemove: () => void;
}

export const Attachment = ({ name, type, uploadSuccess = true, onRemove }: IAttachmentProps) => {
  const iconName = getFileIcon(type);
  return (
    <View style={styles.mainContainer}>
      <View style={styles.iconContainer}>
        {uploadSuccess ? (
          <Icon name={iconName} size={24} color={theme.palette.primary.regular} />
        ) : (
          <ActivityIndicator color={theme.palette.primary.regular} />
        )}
      </View>
      <SmallText numberOfLines={1} ellipsizeMode="middle" style={UI_STYLES.flex1}>
        {name}
      </SmallText>
      <TouchableOpacity onPress={onRemove} style={styles.iconContainer}>
        <Picture
          type="NamedSvg"
          name="pictos-close"
          width={UI_SIZES.dimensions.width.medium}
          height={UI_SIZES.dimensions.height.medium}
          fill={theme.palette.complementary.red.regular}
        />
      </TouchableOpacity>
    </View>
  );
};
