import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { styles } from './styles';
import { SingleMediaCardProps } from './types';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { openPDFReader } from '~/framework/components/pdf/pdf-reader';
import { Svg } from '~/framework/components/picture/svg';
import { SmallText } from '~/framework/components/text';

const SingleMediaCard = ({ media }: Readonly<SingleMediaCardProps>) => {
  const openFile = React.useCallback(() => {
    openPDFReader({
      src: media.src as string,
      title: media.name ? media.name : '',
    });
  }, [media]);

  return (
    <>
      <TouchableOpacity style={styles.attachmentsContainer} onPress={openFile}>
        <View style={styles.iconCard}>
          <Svg
            name="ui-text-page"
            width={UI_SIZES.elements.icon.xlarge}
            height={UI_SIZES.elements.icon.xlarge}
            fill={theme.palette.grey.stone}
          />
        </View>

        <View style={styles.titleCard}>
          <SmallText ellipsizeMode="tail" numberOfLines={1}>
            {media.name}
          </SmallText>
        </View>
      </TouchableOpacity>
    </>
  );
};

export default SingleMediaCard;
