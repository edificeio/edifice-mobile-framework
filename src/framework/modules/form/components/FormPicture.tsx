import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';
import { Picture } from '~/framework/components/picture';
import { Image } from '~/framework/util/media';

const styles = StyleSheet.create({
  container: {
    width: 75,
    height: 75,
    borderRadius: UI_SIZES.radius.medium,
    overflow: 'hidden',
    marginRight: UI_SIZES.spacing.minor,
  },
});

interface IFormPictureProps {
  pictureUri?: string;
}

export const FormPicture = ({ pictureUri }: IFormPictureProps) => {
  const [loadingFailed, setLoadingFailed] = useState<boolean>(false);
  const onError = () => setLoadingFailed(true);

  return (
    <View style={styles.container}>
      {!pictureUri || loadingFailed ? (
        <Picture type="NamedSvg" name="form-default" width={75} height={75} />
      ) : (
        <Image source={{ uri: pictureUri, width: 75, height: 75 }} onError={onError} />
      )}
    </View>
  );
};
