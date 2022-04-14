import * as React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { connect } from 'react-redux';

import { getFileIcon } from '~/modules/support/utils/fileIcon';
import { CommonStyles } from '~/styles/common/styles';
import { Icon } from '~/ui/icons/Icon';

const attachmentStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
} as ViewStyle;

const Attachment = ({ uploadSuccess, uploadProgress, fileType, fileName, onRemove }) => {
  return (
    <TouchableOpacity style={attachmentStyle} onPress={onRemove}>
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: CommonStyles.primaryLight,
            right: undefined,
            width: uploadSuccess ? '100%' : `${uploadProgress}%`,
          },
        ]}
      />
      <Icon size={25} style={{ margin: 10 }} color={CommonStyles.primary} name={getFileIcon(fileType)} />
      <Text style={{ flex: 1, color: CommonStyles.primary }}>{fileName}</Text>
      <Icon name="close" style={{ margin: 10 }} color="red" />
    </TouchableOpacity>
  );
};

const mapStateToProps = (state: any) => ({
  uploadProgress: [state.progress.value],
});

export default connect(mapStateToProps)(Attachment);
