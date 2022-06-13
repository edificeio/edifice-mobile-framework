import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Toast from 'react-native-tiny-toast';
import { ThunkDispatch } from 'redux-thunk';

import theme from '~/app/theme';
import { Icon } from '~/framework/components/picture/Icon';
import { Text, TextBold } from '~/framework/components/text';
import { IDistantFile, IDistantFileWithId, SyncedFileWithId } from '~/framework/util/fileHandler';
import { downloadFileAction } from '~/framework/util/fileHandler/actions';
import { Trackers } from '~/framework/util/tracker';
import { getFileIcon } from '~/modules/zimbra/utils/fileIcon';
import { getUserColor } from '~/modules/zimbra/utils/userColor';
import { BadgeAvatar } from '~/ui/BadgeAvatar';
import { ButtonIcon } from '~/ui/ButtonIconText';
import { CenterPanel, Header, LeftPanel } from '~/ui/ContainerContent';
import TouchableOpacity from '~/ui/CustomTouchableOpacity';

import { Author, findReceivers2, findReceiversAvatars, findSenderAvatar } from './MailItem';

// STYLE

const styles = StyleSheet.create({
  containerMail: {
    padding: 15,
    backgroundColor: theme.palette.grey.white,
  },
  containerMailDetails: {
    padding: 15,
    backgroundColor: theme.palette.grey.white,
    position: 'absolute',
    zIndex: 9,
    top: 12,
    right: 0,
    left: 0,
  },
  gridButton: {
    minWidth: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  gridButtonText: {
    color: theme.palette.primary.regular,
    marginRight: 5,
  },
  gridViewStyle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridButtonTextPJnames: {
    flex: 2,
    color: theme.palette.primary.regular,
    marginLeft: 5,
  },
  dotReceiverColor: {
    width: 8,
    height: 8,
    borderRadius: 15,
    marginTop: 6,
    marginRight: 5,
  },
  greyColor: {
    color: theme.palette.grey.stone,
  },
  shadow: {
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.8,
    marginBottom: 10,
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
    paddingHorizontal: 12,
    flex: 0,
  },
  attachmentListButton: {
    padding: 5,
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
    marginBottom: 10,
  },
  footerButton: {
    backgroundColor: theme.palette.grey.white,
  },
  row: {
    flexDirection: 'row',
  },
  fullView: {
    flex: 1,
    marginLeft: 4,
  },
  headerLeftPanel: {
    justifyContent: 'flex-start',
  },
  headerCenterPanel: {
    marginRight: 5,
    paddingRight: 0,
  },
  detailsDateText: {
    marginTop: 4,
  },
  sendersContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  userContainer: {
    flexDirection: 'row',
    marginLeft: 4,
  },
});

// COMPONENTS

const User = ({ userId, userName }: { userId: string; userName: string }) => {
  const [dotColor, setDotColor] = React.useState('white');

  getUserColor(userId).then(setDotColor);

  return (
    <View style={styles.userContainer} key={userId}>
      <View style={[styles.dotReceiverColor, { backgroundColor: dotColor }]} />
      <Text>{userName}</Text>
    </View>
  );
};

const SendersDetails = ({ receivers, cc, displayNames, inInbox, sender }) => {
  return (
    <View>
      {inInbox || (
        <View style={styles.row}>
          <Text style={styles.greyColor}>{I18n.t('zimbra-from-prefix')}</Text>
          <User userId={sender} userName={displayNames.find(item => item[0] === sender)[1]} />
        </View>
      )}
      <View style={styles.row}>
        <Text style={styles.greyColor}>{I18n.t('zimbra-to-prefix')}</Text>
        <View style={styles.sendersContainer}>
          {receivers.map(receiver => (
            <User userId={receiver} userName={displayNames.find(item => item[0] === receiver)[1]} />
          ))}
        </View>
      </View>
      {cc && (
        <View style={styles.row}>
          <Text style={styles.greyColor}>{I18n.t('zimbra-receiversCC')}</Text>
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
      <Text style={styles.gridButtonText}>{text}</Text>
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
        <Text style={styles.detailsDateText}>{moment(mailInfos.date).format('LL - LT')}</Text>
      ) : (
        <Text style={styles.detailsDateText}>{moment(mailInfos.date).format('dddd LL')}</Text>
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

      {mailInfos.subject && mailInfos.subject.length ? (
        <View style={styles.row}>
          <Text style={styles.greyColor}>{I18n.t('zimbra-subject')} : </Text>
          <TextBold style={styles.fullView}>{mailInfos.subject}</TextBold>
        </View>
      ) : (
        <View />
      )}
    </View>
  );
};

export const HeaderMail = ({ mailInfos, setDetailsVisibility }: { mailInfos: any; setDetailsVisibility: (v: boolean) => void }) => {
  return (
    <View style={styles.containerMail}>
      <HeaderMailInfos mailInfos={mailInfos} setDetailsVisibility={() => setDetailsVisibility(true)} isDetails={false} />

      {mailInfos.subject && mailInfos.subject.length ? (
        <View style={styles.row}>
          <Text style={styles.greyColor}>{I18n.t('zimbra-subject')} : </Text>
          <TextBold style={styles.fullView}>{mailInfos.subject}</TextBold>
        </View>
      ) : (
        <View />
      )}
    </View>
  );
};

export const FooterButton = ({ icon, text, onPress }) => {
  return (
    <View style={styles.footerButtonContainer}>
      <ButtonIcon name={icon} onPress={onPress} style={[styles.footerButton, styles.shadow]} color="black" />
      <Text>{text}</Text>
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
                <Text style={styles.gridButtonTextPJnames} key={item.id} numberOfLines={1} ellipsizeMode="middle">
                  {item.filename}
                </Text>
              </View>

              <View style={[styles.gridViewStyle, styles.attachmentDownloadContainer]}>
                {Platform.OS !== 'ios' ? (
                  <TouchableOpacity
                    onPress={async () => {
                      try {
                        const sf = (await dispatch(downloadFileAction<SyncedFileWithId>(df, {}))) as unknown as SyncedFileWithId;
                        await sf.mirrorToDownloadFolder();
                        Toast.showSuccess(I18n.t('download-success-name', { name: sf.filename }));
                      } catch (e) {
                        Toast.show(I18n.t('download-error-generic'));
                      }
                    }}
                    style={styles.attachmentDownloadButton}>
                    <Icon name="download" size={18} color={theme.palette.primary.regular} />
                  </TouchableOpacity>
                ) : null}
                {index === 0 ? (
                  <TouchableOpacity onPress={() => toggleVisible(!isVisible)} style={styles.attachmentListButton}>
                    {attachments.length > 1 && (
                      <Text style={styles.attachmentListText}>
                        {isVisible ? '-' : '+'}
                        {attachments.length - 1}
                      </Text>
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
