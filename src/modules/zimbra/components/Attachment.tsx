import * as React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';

import theme from '~/app/theme';
import { Icon } from '~/framework/components/picture/Icon';
import { Text } from '~/framework/components/text';
import { getFileIcon } from '~/modules/zimbra/utils/fileIcon';

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backgroundView: {
    position: 'absolute',
    height: '100%',
    backgroundColor: theme.palette.primary.pale,
  },
  iconMargin: {
    marginHorizontal: 12,
    marginVertical: 8,
  },
  nameText: {
    color: theme.palette.primary.regular,
    flexShrink: 1,
  },
});

interface IAttachmentProps {
  name: string;
  type: string;
  uploadSuccess: boolean;
  uploadProgress?: number;
  onRemove: () => void;
}

const Attachment = ({ name, type, uploadSuccess, uploadProgress, onRemove }: IAttachmentProps) => {
  const width = uploadSuccess ? '100%' : `${uploadProgress}%`;
  const iconName = getFileIcon(type);
  return (
    <TouchableOpacity style={styles.mainContainer} onPress={onRemove}>
      <View
        style={[
          styles.backgroundView,
          {
            width,
          },
        ]}
      />
      <Icon name={iconName} size={25} color={theme.palette.primary.regular} style={styles.iconMargin} />
      <Text numberOfLines={2} style={styles.nameText}>
        {name}
      </Text>
      <Icon name="close" size={14} color={theme.palette.complementary.red.regular} style={styles.iconMargin} />
    </TouchableOpacity>
  );
};

const mapStateToProps = (state: any) => ({
  uploadProgress: [state.progress.value],
});

export default connect(mapStateToProps)(Attachment);
