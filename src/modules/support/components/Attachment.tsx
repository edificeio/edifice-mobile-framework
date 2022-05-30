import * as React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { connect } from 'react-redux';

import { Icon } from '~/framework/components/picture/Icon';
import { Text } from '~/framework/components/text';
import { getFileIcon } from '~/modules/support/utils/fileIcon';
import { CommonStyles } from '~/styles/common/styles';

const attachmentStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
} as ViewStyle;

const styles = StyleSheet.create({
  attachmentView: {
    backgroundColor: CommonStyles.primaryLight,
    right: undefined,
  },
  iconStyle: {
    margin: 10,
  },
  fileNameText: {
    flex: 1,
    color: CommonStyles.primary,
  },
});

const Attachment = ({ uploadSuccess, uploadProgress, fileType, fileName, onRemove }) => {
  return (
    <TouchableOpacity style={attachmentStyle} onPress={onRemove}>
      <View
        style={[
          StyleSheet.absoluteFill,
          [
            styles.attachmentView,
            {
              width: uploadSuccess ? '100%' : `${uploadProgress}%`,
            },
          ],
        ]}
      />
      <Icon size={25} style={styles.iconStyle} color={CommonStyles.primary} name={getFileIcon(fileType)} />
      <Text style={styles.fileNameText}>{fileName}</Text>
      <Icon name="close" style={styles.iconStyle} color="red" />
    </TouchableOpacity>
  );
};

const mapStateToProps = (state: any) => ({
  uploadProgress: [state.progress.value],
});

export default connect(mapStateToProps)(Attachment);
