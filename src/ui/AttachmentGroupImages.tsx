import * as React from 'react';
import { View, TouchableOpacity, FlatList, Image } from 'react-native';

import { IconButton } from './IconButton';

import { Trackers } from '~/framework/util/tracker';
import { mainNavNavigate } from '~/navigation/helpers/navHelper';
import { CommonStyles } from '~/styles/common/styles';
import { ContentUri } from '~/types/contentUri';

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
        renderItem={({ item, index }) => {
          return (
            <View style={{ paddingTop: 20 }}>
              <TouchableOpacity
                onPress={() => {
                  mainNavNavigate('carouselModal', { images: carouselImages, startIndex: index });
                  Trackers.trackEvent('Post creation', 'OPEN ATTACHMENT', 'Edit mode');
                  //FIXME: ugly code here  (module name (1st argument) must be obtained dynamically)
                }}
                style={{
                  shadowColor: '#6B7C93',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.8,
                  elevation: 10,
                  backgroundColor: 'white',
                  marginRight: index === attachments.length - 1 ? 15 : 30,
                }}>
                <Image source={{ uri: item.uri }} style={{ width: 110, height: 110, borderRadius: 3 }} resizeMode="cover" />
              </TouchableOpacity>
              <View style={{ position: 'absolute', left: 85, top: -7, elevation: 10 }}>
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
                    iconColor="#000000"
                    iconSize={18}
                    buttonStyle={{ backgroundColor: CommonStyles.lightGrey }}
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
