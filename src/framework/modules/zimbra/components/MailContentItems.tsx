import * as React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Icon } from '~/framework/components/picture/Icon';
import { SmallText } from '~/framework/components/text';
import Toast from '~/framework/components/toast';
import { getSession } from '~/framework/modules/auth/reducer';
import { getFileIcon } from '~/framework/modules/zimbra/utils/fileIcon';
import { IDistantFileWithId } from '~/framework/util/fileHandler';
import fileTransferService from '~/framework/util/fileHandler/service';
import { ButtonIcon } from '~/ui/ButtonIconText';

const styles = StyleSheet.create({
  gridViewStyle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridButtonTextPJnames: {
    flex: 2,
    color: theme.palette.primary.regular,
    marginLeft: UI_SIZES.spacing.tiny,
  },
  shadow: {
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.8,
    marginBottom: UI_SIZES.spacing.minor,
  },
  attachmentsContainer: {
    marginTop: UI_SIZES.spacing.small,
  },
  attachmentGridView: {
    justifyContent: 'space-between',
  },
  attachmentGridViewChild: {
    justifyContent: 'flex-start',
    flex: 1,
  },
  attachmentDownloadContainer: {
    justifyContent: 'flex-end',
  },
  attachmentDownloadButton: {
    paddingHorizontal: UI_SIZES.spacing.small,
    flex: 0,
  },
  attachmentListButton: {
    padding: UI_SIZES.spacing.tiny,
  },
  attachmentListText: {
    color: theme.palette.primary.regular,
  },
  attachmentEmpty: {
    width: 25,
    height: 30,
  },
  footerButtonContainer: {
    alignItems: 'center',
  },
  footerButton: {
    backgroundColor: theme.palette.grey.white,
  },
});

export const FooterButton = ({ icon, text, onPress }) => {
  return (
    <View style={styles.footerButtonContainer}>
      <ButtonIcon name={icon} onPress={onPress} style={[styles.footerButton, styles.shadow]} color={theme.palette.grey.black} />
      <SmallText>{text}</SmallText>
    </View>
  );
};

export const RenderPJs = ({ attachments }: { attachments: IDistantFileWithId[] }) => {
  const [isVisible, toggleVisible] = React.useState(false);
  const displayedAttachments = isVisible ? attachments : attachments.slice(0, 1);
  const session = getSession();
  return (
    <View style={styles.attachmentsContainer}>
      {displayedAttachments.map((item, index) => {
        return (
          <TouchableOpacity
            key={item.id}
            onPress={async () => {
              try {
                if (!session) throw new Error();
                const sf = await fileTransferService.downloadFile(session, item, {});
                await sf.open();
              } catch {
                Toast.showError(I18n.get('zimbra-mail-download-error'));
              }
            }}>
            <View style={[styles.gridViewStyle, styles.attachmentGridView]}>
              <View style={[styles.gridViewStyle, styles.attachmentGridViewChild]}>
                <Icon size={25} color={theme.palette.primary.regular} name={getFileIcon(item.filetype)} />
                <SmallText style={styles.gridButtonTextPJnames} key={item.id} numberOfLines={1} ellipsizeMode="middle">
                  {item.filename}
                </SmallText>
              </View>
              <View style={[styles.gridViewStyle, styles.attachmentDownloadContainer]}>
                {Platform.OS === 'android' ? (
                  <TouchableOpacity
                    onPress={async () => {
                      try {
                        if (!session) throw new Error();
                        const sf = await fileTransferService.downloadFile(session, item, {});
                        await sf.mirrorToDownloadFolder();
                        Toast.showSuccess(I18n.get('zimbra-mail-download-success', { name: sf.filename }));
                      } catch {
                        Toast.showError(I18n.get('zimbra-mail-download-error'));
                      }
                    }}
                    style={styles.attachmentDownloadButton}>
                    <Icon name="download" size={18} color={theme.palette.primary.regular} />
                  </TouchableOpacity>
                ) : null}
                {index === 0 ? (
                  <TouchableOpacity onPress={() => toggleVisible(!isVisible)} style={styles.attachmentListButton}>
                    {attachments.length > 1 && (
                      <SmallText style={styles.attachmentListText}>
                        {isVisible ? '-' : '+'}
                        {attachments.length - 1}
                      </SmallText>
                    )}
                  </TouchableOpacity>
                ) : (
                  <View style={styles.attachmentEmpty} />
                )}
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
