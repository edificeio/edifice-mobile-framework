import * as React from 'react';
import { FlatList, SafeAreaView, TouchableOpacity, View } from 'react-native';
import { TouchableOpacity as RNGHTouchableOpacity } from 'react-native-gesture-handler';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Icon } from '~/framework/components/picture/Icon';
import { CaptionText, SmallBoldText } from '~/framework/components/text';

import Attachment, { IRemoteAttachment } from './Attachment';
import { BubbleStyle } from './BubbleStyle';

export class AttachmentGroup extends React.PureComponent<
  {
    attachments: IRemoteAttachment[];
    containerStyle?: any;
    editMode?: boolean;
    isContainerHalfScreen?: boolean;
    attachmentsHeightHalfScreen?: number;
    onRemove?: (index: number) => void;
    onDownload?: () => void;
    onError?: () => void;
    onOpen?: () => void;
    onDownloadAll?: () => void;
  },
  {
    downloadAll: boolean;
  }
> {
  public constructor(props) {
    super(props);
    this.state = {
      downloadAll: false,
    };
  }

  public render() {
    const {
      attachments,
      editMode,
      containerStyle,
      isContainerHalfScreen,
      attachmentsHeightHalfScreen,
      onRemove,
      onDownload,
      onDownloadAll,
      onError,
      onOpen,
    } = this.props;
    const { downloadAll } = this.state;
    return (
      <TouchableOpacity activeOpacity={1} style={containerStyle}>
        {editMode ? null : (
          <BubbleStyle
            style={{
              flex: 1,
              marginTop: 0,
              marginBottom: 0,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <View style={{ flexDirection: 'row' }}>
              <SmallBoldText style={{ marginRight: UI_SIZES.spacing.tiny }}>
                {I18n.get(`attachment-attachment${attachments.length > 1 ? 's' : ''}`)}
              </SmallBoldText>
              <Icon
                color={theme.ui.text.regular}
                size={16}
                name="attached"
                style={{ flex: 0, marginRight: UI_SIZES.spacing.minor, transform: [{ rotate: '270deg' }] }}
              />
            </View>
            {attachments.length > 1 ? (
              <RNGHTouchableOpacity
                onPress={() => {
                  this.setState({ downloadAll: true });
                  onDownloadAll && onDownloadAll();
                }}>
                <CaptionText style={{ color: theme.palette.complementary.blue.regular }}>
                  {I18n.get('attachment-download-all')}
                </CaptionText>
              </RNGHTouchableOpacity>
            ) : null}
          </BubbleStyle>
        )}
        <BubbleStyle
          style={{
            flex: 0,
            paddingVertical: UI_SIZES.spacing.tiny / 2,
            marginTop: 0,
            marginBottom: 0,
            maxHeight: editMode ? 150 : undefined,
          }}>
          <SafeAreaView>
            <FlatList
              style={{ flex: 0 }}
              data={attachments}
              renderItem={({ item, index }) => (
                <View onStartShouldSetResponder={() => true}>
                  <Attachment
                    key={index}
                    attachment={item}
                    starDownload={downloadAll}
                    onDownload={onDownload}
                    onError={onError}
                    onOpen={onOpen}
                    style={{ marginTop: index === 0 ? 0 : UI_SIZES.spacing.tiny / 2 }}
                    editMode={editMode && !item.hasOwnProperty('id')}
                    onRemove={() => onRemove && onRemove(index)}
                  />
                </View>
              )}
            />
          </SafeAreaView>
        </BubbleStyle>
      </TouchableOpacity>
    );
  }
}
