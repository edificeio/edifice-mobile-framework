import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-tiny-toast';
import { ThunkDispatch } from 'redux-thunk';

import theme from '~/app/theme';
import { UI_ANIMATIONS, UI_SIZES } from '~/framework/components/constants';
import { Icon } from '~/framework/components/picture/Icon';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import { getFileIcon } from '~/framework/modules/zimbra/utils/fileIcon';
import { getUserColor } from '~/framework/modules/zimbra/utils/userColor';
import { IDistantFile, IDistantFileWithId, SyncedFileWithId } from '~/framework/util/fileHandler';
import { downloadFileAction } from '~/framework/util/fileHandler/actions';
import { Trackers } from '~/framework/util/tracker';
import { BadgeAvatar } from '~/ui/BadgeAvatar';
import { ButtonIcon } from '~/ui/ButtonIconText';
import { CenterPanel, Header, LeftPanel } from '~/ui/ContainerContent';

import { Author, findReceivers2, findReceiversAvatars, findSenderAvatar } from './MailItem';

// STYLE

const styles = StyleSheet.create({
  containerMail: {
    padding: UI_SIZES.spacing.medium,
    backgroundColor: theme.palette.grey.white,
  },
  containerMailDetails: {
    padding: UI_SIZES.spacing.medium,
    backgroundColor: theme.palette.grey.white,
    position: 'absolute',
    zIndex: 9,
    right: 0,
    left: 0,
  },
  gridButton: {
    minWidth: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: UI_SIZES.spacing.tiny,
  },
  gridButtonText: {
    color: theme.palette.primary.regular,
    marginRight: UI_SIZES.spacing.tiny,
  },
  gridViewStyle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridButtonTextPJnames: {
    flex: 2,
    color: theme.palette.primary.regular,
    marginLeft: UI_SIZES.spacing.tiny,
  },
  dotReceiverColor: {
    width: 8,
    height: 8,
    borderRadius: 15,
    marginTop: UI_SIZES.spacing.minor,
    marginRight: UI_SIZES.spacing.tiny,
  },
  greyColor: {
    color: theme.ui.text.light,
  },
  shadow: {
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.8,
    marginBottom: UI_SIZES.spacing.minor,
  },
  attachmentContainer: {
    flexDirection: 'column',
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
    justifyContent: 'space-evenly',
    marginBottom: UI_SIZES.spacing.minor,
  },
  footerButton: {
    backgroundColor: theme.palette.grey.white,
  },
  row: {
    flexDirection: 'row',
  },
  fullView: {
    flex: 1,
    marginLeft: UI_SIZES.spacing.tiny,
  },
  headerLeftPanel: {
    justifyContent: 'flex-start',
  },
  headerCenterPanel: {
    marginRight: UI_SIZES.spacing.tiny,
    paddingRight: 0,
  },
  detailsDateText: {
    marginTop: UI_SIZES.spacing.tiny,
  },
  sendersContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  userContainer: {
    flexDirection: 'row',
    marginLeft: UI_SIZES.spacing.tiny,
  },
});

// COMPONENTS

const User = ({ userId, userName }: { userId: string; userName: string }) => {
  const [dotColor, setDotColor] = React.useState(theme.palette.grey.white);

  getUserColor(userId).then(setDotColor);

  return (
    <View style={styles.userContainer} key={userId}>
      <View style={[styles.dotReceiverColor, { backgroundColor: dotColor }]} />
      <SmallText>{userName}</SmallText>
    </View>
  );
};

const SendersDetails = ({ receivers, cc, displayNames, inInbox, sender }) => {
  return (
    <View>
      {inInbox || (
        <View style={styles.row}>
          <SmallText style={styles.greyColor}>{I18n.t('zimbra-from-prefix')}</SmallText>
          <User userId={sender} userName={displayNames.find(item => item[0] === sender)[1]} />
        </View>
      )}
      <View style={styles.row}>
        <SmallText style={styles.greyColor}>{I18n.t('zimbra-to-prefix')}</SmallText>
        <View style={styles.sendersContainer}>
          {receivers.map(receiver => (
            <User userId={receiver} userName={displayNames.find(item => item[0] === receiver)[1]} />
          ))}
        </View>
      </View>
      {cc && (
        <View style={styles.row}>
          <SmallText style={styles.greyColor}>{I18n.t('zimbra-receiversCC')}</SmallText>
          <View style={styles.sendersContainer}>
            {cc.map(person => (
              <User userId={person} userName={displayNames.find(item => item[0] === person)[1]} />
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const IconButton = ({ icon, color, text, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.gridButton}>
      <SmallText style={styles.gridButtonText}>{text}</SmallText>
      <Icon size={12} color={color} name={icon} />
    </TouchableOpacity>
  );
};

const HeaderMailInfos = ({
  mailInfos,
  setDetailsVisibility,
  isDetails,
}: {
  mailInfos: any;
  setDetailsVisibility: (v: boolean) => void;
  isDetails: boolean;
}) => {
  const inOutboxOrDraft = mailInfos.systemFolder === 'OUTBOX' || mailInfos.systemFolder === 'DRAFT';
  return (
    <Header>
      <LeftPanel style={styles.headerLeftPanel}>
        <BadgeAvatar
          avatars={
            inOutboxOrDraft
              ? findReceiversAvatars(mailInfos.to, mailInfos.from, mailInfos.cc, mailInfos.displayNames)
              : findSenderAvatar(mailInfos.from, mailInfos.displayNames)
          }
          badgeContent={mailInfos.unread}
        />
      </LeftPanel>

      <CenterPanel style={styles.headerCenterPanel}>
        <Author nb={mailInfos.unread} numberOfLines={1}>
          {inOutboxOrDraft
            ? findReceivers2(mailInfos.to, mailInfos.from, mailInfos.cc)
                .map(r => {
                  const u = mailInfos.displayNames.find(dn => dn[0] === r);
                  return u ? u[1] : I18n.t('unknown-user');
                })
                .join(', ')
            : mailInfos.displayNames.find(dn => dn[0] === mailInfos.from)[1]}
        </Author>
        <IconButton
          onPress={setDetailsVisibility}
          text={I18n.t('zimbra-see_detail')}
          color={theme.palette.primary.regular}
          icon={!isDetails ? 'keyboard_arrow_down' : 'keyboard_arrow_up'}
        />
      </CenterPanel>
      {!isDetails ? (
        <SmallText style={styles.detailsDateText}>{moment(mailInfos.date).format('LL - LT')}</SmallText>
      ) : (
        <SmallText style={styles.detailsDateText}>{moment(mailInfos.date).format('dddd LL')}</SmallText>
      )}
    </Header>
  );
};

// EXPORTED COMPONENTS

export const HeaderMailDetails = ({
  mailInfos,
  setDetailsVisibility,
}: {
  mailInfos: any;
  setDetailsVisibility: (v: boolean) => void;
}) => {
  const inInbox = mailInfos.systemFolder === 'INBOX';
  return (
    <View style={[styles.containerMailDetails, styles.shadow]}>
      <HeaderMailInfos mailInfos={mailInfos} setDetailsVisibility={() => setDetailsVisibility(false)} isDetails />
      <SendersDetails
        receivers={mailInfos.to}
        cc={mailInfos.cc}
        displayNames={mailInfos.displayNames}
        inInbox={inInbox}
        sender={mailInfos.from}
      />
      <View style={styles.row}>
        <SmallText style={styles.greyColor}>{I18n.t('zimbra-subject')} : </SmallText>
        <SmallBoldText style={styles.fullView}>{mailInfos.subject}</SmallBoldText>
      </View>
    </View>
  );
};

export const HeaderMail = ({ mailInfos, setDetailsVisibility }: { mailInfos: any; setDetailsVisibility: (v: boolean) => void }) => {
  return (
    <View style={styles.containerMail}>
      <HeaderMailInfos mailInfos={mailInfos} setDetailsVisibility={() => setDetailsVisibility(true)} isDetails={false} />
      <View style={styles.row}>
        <SmallText style={styles.greyColor}>{I18n.t('zimbra-subject')} : </SmallText>
        <SmallBoldText style={styles.fullView}>{mailInfos.subject}</SmallBoldText>
      </View>
    </View>
  );
};

export const FooterButton = ({ icon, text, onPress }) => {
  return (
    <View style={styles.footerButtonContainer}>
      <ButtonIcon name={icon} onPress={onPress} style={[styles.footerButton, styles.shadow]} color={theme.palette.grey.black} />
      <SmallText>{text}</SmallText>
    </View>
  );
};

export const RenderPJs = ({
  attachments,
  mailId,
  onDownload,
  dispatch,
}: {
  attachments: IDistantFile[];
  mailId: string;
  onDownload: (att: IDistantFile) => void;
  dispatch: ThunkDispatch<any, any, any>;
}) => {
  const [isVisible, toggleVisible] = React.useState(false);
  const displayedAttachments = isVisible ? attachments : (attachments.slice(0, 1) as any);
  return (
    <View style={[styles.containerMail, styles.attachmentContainer]}>
      {displayedAttachments.map((item, index) => {
        const df: IDistantFileWithId = {
          url: `/conversation/message/${mailId}/attachment/${item.id}`,
          id: item.id,
          filename: item.filename,
          filesize: item.size,
          filetype: item.contentType,
        };
        return (
          <TouchableOpacity
            onPress={() => {
              Trackers.trackEvent('Zimbra', 'DOWNLOAD ATTACHMENT');
              onDownload(df);
            }}>
            <View style={[styles.gridViewStyle, styles.attachmentGridView]}>
              <View style={[styles.gridViewStyle, styles.attachmentGridViewChild]}>
                <Icon size={25} color={theme.palette.primary.regular} name={getFileIcon(item.contentType)} />
                <SmallText style={styles.gridButtonTextPJnames} key={item.id} numberOfLines={1} ellipsizeMode="middle">
                  {item.filename}
                </SmallText>
              </View>

              <View style={[styles.gridViewStyle, styles.attachmentDownloadContainer]}>
                {Platform.OS !== 'ios' ? (
                  <TouchableOpacity
                    onPress={async () => {
                      try {
                        const sf = (await dispatch(downloadFileAction<SyncedFileWithId>(df, {}))) as unknown as SyncedFileWithId;
                        await sf.mirrorToDownloadFolder();
                        Toast.showSuccess(I18n.t('download-success-name', { name: sf.filename }), { ...UI_ANIMATIONS.toast });
                      } catch {
                        Toast.show(I18n.t('download-error-generic'), { ...UI_ANIMATIONS.toast });
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
