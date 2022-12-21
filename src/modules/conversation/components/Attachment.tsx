import * as React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { connect } from 'react-redux';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Icon } from '~/framework/components/picture/Icon';
import { SmallText } from '~/framework/components/text';
import { getFileIcon } from '~/modules/conversation/utils/fileIcon';

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
          {
            backgroundColor: theme.palette.complementary.blue.pale,
            right: undefined,
            width: uploadSuccess ? '100%' : `${uploadProgress}%`,
          },
        ]}
      />
      <Icon
        size={25}
        style={{ margin: UI_SIZES.spacing.small }}
        color={theme.palette.complementary.blue.regular}
        name={getFileIcon(fileType)}
      />
      <SmallText style={{ flex: 1, color: theme.palette.complementary.blue.regular }}>{fileName}</SmallText>
      <TouchableOpacity onPress={onRemove}>
        <Icon name="close" style={{ margin: UI_SIZES.spacing.small }} color={theme.palette.status.failure.regular} />
      </TouchableOpacity>
    </View>
  );
};

const mapStateToProps = (state: any) => ({
  uploadProgress: [state.progress.value],
});

export default connect(mapStateToProps)(Attachment);
