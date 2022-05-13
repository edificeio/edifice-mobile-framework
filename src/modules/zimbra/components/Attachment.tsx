import * as React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { connect } from 'react-redux';

import { getFileIcon } from '~/modules/zimbra/utils/fileIcon';
import { CommonStyles } from '~/styles/common/styles';
import { Icon } from '~/ui/icons/Icon';

const styles = StyleSheet.create({
  attachementUploadBar: {
    backgroundColor: CommonStyles.primaryLight,
    right: undefined,
  },
  attachmentUploadStatus: {
    width: '100%',
  },
  iconMargin: { marginRight: 10 },
  fileNameText: {
    flex: 1,
    color: CommonStyles.primary,
  },
});

const attachmentStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
} as ViewStyle;

const Attachment = ({ uploadSuccess, uploadProgress, fileType, fileName, onRemove }) => {
  return (
    <View style={attachmentStyle}>
      <View
        style={[
          StyleSheet.absoluteFill,
          styles.attachementUploadBar,
          uploadSuccess ? styles.attachmentUploadStatus : { width: `${uploadProgress}%` },
        ]}
      />
      <Icon size={25} style={styles.iconMargin} color={CommonStyles.primary} name={getFileIcon(fileType)} />
      <Text style={styles.fileNameText}>{fileName}</Text>
      <TouchableOpacity onPress={onRemove}>
        <Icon name="close" style={styles.iconMargin} color="red" />
      </TouchableOpacity>
    </View>
  );
};

const mapStateToProps = (state: any) => ({
  uploadProgress: [state.progress.value],
});

export default connect(mapStateToProps)(Attachment);
