import * as React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Icon } from '~/framework/components/picture/Icon';
import { SmallText } from '~/framework/components/text';
import { getFileIcon } from '~/framework/modules/conversation/utils/fileIcon';

const attachmentStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
} as ViewStyle;

const Attachment = ({ uploadSuccess, uploadProgress, fileType, fileName, onRemove }) => {
  //FIXME: create/move to styles.ts
  const styles = StyleSheet.create({
    fileName: { flex: 1, color: theme.palette.complementary.blue.regular },
    uploadBar: {
      backgroundColor: theme.palette.complementary.blue.pale,
      right: undefined,
    },
  });
  const uploadBarWidth = { width: uploadSuccess ? '100%' : `${uploadProgress}%` };
  return (
    <View style={attachmentStyle}>
      <View style={[StyleSheet.absoluteFill, styles.uploadBar, uploadBarWidth]} />
      <Icon
        size={25}
        style={{ margin: UI_SIZES.spacing.small }}
        color={theme.palette.complementary.blue.regular}
        name={getFileIcon(fileType)}
      />
      <SmallText style={styles.fileName}>{fileName}</SmallText>
      <TouchableOpacity onPress={onRemove}>
        <Icon name="close" style={{ margin: UI_SIZES.spacing.small }} color={theme.palette.status.failure.regular} />
      </TouchableOpacity>
    </View>
  );
};

export default Attachment;
