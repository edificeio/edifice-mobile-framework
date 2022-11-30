import * as React from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Image, formatSource } from '~/framework/util/media';
import { Trackers } from '~/framework/util/tracker';
import { mainNavNavigate } from '~/navigation/helpers/navHelper';
import { ContentUri } from '~/types/contentUri';

import { IconButton } from './IconButton';

export class AttachmentGroupImages extends React.PureComponent<{
  attachments: ContentUri[];
  onRemove: (index: number) => void;
}> {
  public render() {
    const { attachments, onRemove } = this.props;
    const carouselImages = attachments.map(att => ({ src: { uri: att.uri }, alt: 'image' }));

    return (
      <FlatList
        data={attachments}
        horizontal
        persistentScrollbar
        contentContainerStyle={{ padding: UI_SIZES.spacing.small }}
        renderItem={({ item, index }) => {
          return (
            <View
              style={{
                marginTop: UI_SIZES.spacing._LEGACY_small,
                marginRight: index === attachments.length - 1 ? UI_SIZES.spacing.small : UI_SIZES.spacing.big,
              }}>
              <TouchableOpacity
                onPress={() => {
                  mainNavNavigate('carouselModal', { images: carouselImages, startIndex: index });
                  Trackers.trackEvent('Post creation', 'OPEN ATTACHMENT', 'Edit mode');
                  //FIXME: ugly code here  (module name (1st argument) must be obtained dynamically)
                }}
                style={{
                  shadowColor: theme.ui.shadowColor,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  elevation: 7,
                  backgroundColor: theme.ui.background.card,
                  borderRadius: 3,
                }}>
                <Image source={formatSource(item.uri)} style={{ width: 110, height: 110, borderRadius: 3 }} resizeMode="cover" />
              </TouchableOpacity>
              <View style={{ position: 'absolute', right: -25, top: -25, elevation: 10 }}>
                <TouchableOpacity
                  onPress={() => onRemove(index)}
                  style={{
                    width: 50,
                    height: 50,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <IconButton
                    iconName="close"
                    iconColor={theme.palette.grey.black}
                    iconSize={18}
                    buttonStyle={{
                      backgroundColor: theme.palette.grey.fog,
                      shadowColor: theme.ui.shadowColor,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.15,
                      elevation: 7,
                    }}
                  />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    );
  }
}
