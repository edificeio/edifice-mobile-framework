import * as React from 'react';
import { Platform, View } from 'react-native';

import styles from './styles';
import { ThumbnailProps } from './types';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { CaptionText } from '~/framework/components/text';
import { UploadAttachmentStatus } from '~/framework/modules/mails/components/attachments/modal-import/types';
import { Image } from '~/framework/util/media';

function getFileExtension(filename) {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop() : '';
}

export default function Thumbnail(props: ThumbnailProps) {
  const { data } = props;
  const [error, setError] = React.useState<boolean>(false);

  const renderErrorImage = React.useCallback(() => {
    return (
      <View
        style={[
          styles.addFilesResultsType,
          {
            backgroundColor: theme.palette.complementary.purple.pale,
          },
        ]}>
        <CaptionText>{getFileExtension(data.localFile.filename)}</CaptionText>
      </View>
    );
  }, [data.localFile.filename]);

  const renderImage = React.useCallback(() => {
    const filePath = Platform.OS === 'android' ? `file://${data.localFile._filepathNative}` : data.localFile._filepathNative;
    if (error) return renderErrorImage();
    return (
      <Image
        style={styles.addFilesResultsType}
        src={filePath}
        onError={() => {
          console.warn('Error loading image', data.localFile._filepathNative);
          setError(true);
        }}
      />
    );
  }, [data.localFile, error, renderErrorImage]);

  return data.status === UploadAttachmentStatus.OK ? (
    renderImage()
  ) : (
    <View
      style={[
        styles.addFilesResultsType,
        {
          backgroundColor:
            data.status === UploadAttachmentStatus.KO ? theme.palette.status.failure.pale : theme.palette.complementary.green.pale,
        },
      ]}>
      <Svg
        name={data.status === UploadAttachmentStatus.KO ? 'ui-error' : 'ui-image'}
        height={UI_SIZES.elements.icon.small}
        width={UI_SIZES.elements.icon.small}
        fill={data.status === UploadAttachmentStatus.KO ? theme.palette.status.failure.regular : theme.palette.grey.black}
      />
    </View>
  );
}
