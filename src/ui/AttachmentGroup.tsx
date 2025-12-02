import * as React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import Attachment, { ILocalAttachment, IRemoteAttachment } from './Attachment';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { SmallBoldText } from '~/framework/components/text';
import { markViewAudience } from '~/framework/modules/audience';
import { AudienceParameter } from '~/framework/modules/audience/types';

const getAttachmentStyle = (index: number) => {
  return {
    marginTop: index === 0 ? 0 : UI_SIZES.spacing.tiny / 2,
  };
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.palette.grey.fog,
    borderColor: theme.palette.grey.pearl,
    borderRadius: UI_SIZES.radius.newCard,
    borderWidth: UI_SIZES.elements.border.thin,
    padding: UI_SIZES.spacing.small,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: UI_SIZES.spacing.small,
  },
});

export class AttachmentGroup extends React.PureComponent<
  {
    attachments: (IRemoteAttachment | ILocalAttachment)[];
    containerStyle?: any;
    editMode?: boolean;
    isContainerHalfScreen?: boolean;
    attachmentsHeightHalfScreen?: number;
    onRemove?: (index: number) => void;
    onDownload?: () => void;
    onError?: () => void;
    onOpen?: () => void;
    onDownloadAll?: () => void;
    referer: AudienceParameter;
  },
  {
    downloadAll: boolean;
  }
> {
  constructor(props) {
    super(props);
    this.state = {
      downloadAll: false,
    };
  }

  render() {
    const { attachments, containerStyle, editMode, onDownload, onError, onOpen, onRemove } = this.props;
    const { downloadAll } = this.state;

    return (
      <TouchableOpacity activeOpacity={1} style={[styles.container, containerStyle]}>
        {!editMode ? (
          <View style={styles.header}>
            <SmallBoldText>{I18n.get(attachments.length > 1 ? 'attachment-attachments' : 'attachment-attachment')}</SmallBoldText>
          </View>
        ) : null}

        <View style={{ paddingVertical: UI_SIZES.spacing.tiny / 2 }}>
          {attachments.map((item, index) => (
            <Attachment
              key={`attachment#${index}`}
              attachment={item}
              starDownload={downloadAll}
              onDownload={() => {
                onDownload?.();
                if (this.props.referer) markViewAudience(this.props.referer);
              }}
              onError={onError}
              onOpen={onOpen}
              style={getAttachmentStyle(index)}
              editMode={editMode && !item.hasOwnProperty('id')}
              onRemove={() => onRemove?.(index)}
            />
          ))}
        </View>
      </TouchableOpacity>
    );
  }
}
