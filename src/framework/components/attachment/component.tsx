import * as React from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';

import styles from './styles';
import { IAttachmentProps } from './types';

import theme from '~/app/theme';
import { UI_SIZES, UI_STYLES } from '~/framework/components/constants';
import { Icon, Svg } from '~/framework/components/picture';
import { SmallText } from '~/framework/components/text';
import { mimeCompare } from '~/framework/util/media/mime';

const fileIconPatterns = [
  { icon: 'picture', pattern: 'image/*' },
  { icon: 'file-audio', pattern: 'audio/*' },
  { icon: 'file-video-outline', pattern: 'video/*' },
  { icon: 'pdf_files', pattern: 'application/pdf' },
  { icon: 'file-document-outline', pattern: 'text/*' },
];

const getFileIcon = (type?: string): string => {
  if (!type) return 'file-document-outline';

  for (const { icon, pattern } of fileIconPatterns) {
    if (mimeCompare(type, pattern) === 0) {
      return icon;
    }
  }

  return 'file-document-outline';
};

export const Attachment = ({ name, onRemove, type, uploadSuccess = true }: IAttachmentProps) => {
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
      <TouchableOpacity onPress={onRemove} disabled={!uploadSuccess} style={styles.iconContainer}>
        <Svg
          name="pictos-close"
          width={UI_SIZES.dimensions.width.medium}
          height={UI_SIZES.dimensions.height.medium}
          fill={uploadSuccess ? theme.palette.complementary.red.regular : theme.palette.grey.grey}
        />
      </TouchableOpacity>
    </View>
  );
};
