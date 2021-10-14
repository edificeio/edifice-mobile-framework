import style from "glamorous-native";
import I18n from "i18n-js";
import moment from "moment";
import * as React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { IDistantFile, IDistantFileWithId, SyncedFileWithId } from "../../../framework/util/fileHandler";
import { Trackers } from "../../../framework/util/tracker";

import { Icon } from "../../../ui";
import { BadgeAvatar } from "../../../ui/BadgeAvatar";
import { ButtonIcon } from "../../../ui/ButtonIconText";
import { Header, CenterPanel, LeftPanel } from "../../../ui/ContainerContent";
import TouchableOpacity from "../../../ui/CustomTouchableOpacity";
import { Text, TextBold } from "../../../framework/components/text";
import { getFileIcon } from "../utils/fileIcon";
import { getUserColor, getProfileColor } from "../utils/userColor";
import { findReceivers2, findReceiversAvatars, Author, findSenderAvatar } from "./MailItem";
import Toast from "react-native-tiny-toast";
import { downloadFileAction } from "../../../framework/util/fileHandler/actions";
import { ThunkDispatch } from "redux-thunk";

const User = ({ userId, userName }) => {
  const [dotColor, setDotColor] = React.useState(getProfileColor("Guest"));

  getUserColor(userId).then(setDotColor);

  return (
    <View style={{ flexDirection: "row", marginLeft: 5 }} key={userId}>
      <View style={[styles.dotReceiverColor, { backgroundColor: dotColor }]} />
      <Text>{userName}</Text>
    </View>
  );
};

const SendersDetails = ({ receivers, cc, displayNames, inInbox, sender }) => {
  return (
    <View>
      {inInbox || (
        <View style={{ flexDirection: "row" }}>
          <Text style={styles.greyColor}>{I18n.t("zimbra-from-prefix")}</Text>
          <User userId={sender} userName={displayNames.find(item => item[0] === sender)[1]} />
        </View>
      )}
      <View style={{ flexDirection: "row" }}>
        <Text style={styles.greyColor}>{I18n.t("zimbra-to-prefix")}</Text>
        {receivers.map(receiver => (
          <User userId={receiver} userName={displayNames.find(item => item[0] === receiver)[1]} />
        ))}
      </View>
      {cc && (
        <View style={{ flexDirection: "row" }}>
          <Text style={styles.greyColor}>{I18n.t("zimbra-receiversCC")}</Text>
          {cc.map(person => (
            <User userId={person} userName={displayNames.find(item => item[0] === person)[1]} />
          ))}
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

// EXPORTED COMPONENTS

export const HeaderMail = ({ mailInfos }) => {
  const [isVisible, toggleVisible] = React.useState(false);
  const inInbox = mailInfos.systemFolder === "INBOX";
  const inOutboxOrDraft = mailInfos.systemFolder === "OUTBOX" || mailInfos.systemFolder === "DRAFT";
  return (
    <View style={styles.containerMail}>
      <Header>
        <LeftPanel style={{ justifyContent: "flex-start" }}>
          <BadgeAvatar
            avatars={
              inOutboxOrDraft
                ? findReceiversAvatars(mailInfos.to, mailInfos.from, mailInfos.cc, mailInfos.displayNames)
                : findSenderAvatar(mailInfos.from, mailInfos.displayNames)
            }
            badgeContent={mailInfos.unread}
          />
        </LeftPanel>

        <CenterPanel style={{ marginRight: 0, paddingRight: 0 }}>
          <Author nb={mailInfos.unread} numberOfLines={1}>
            {inOutboxOrDraft
              ? findReceivers2(mailInfos.to, mailInfos.from, mailInfos.cc)
                .map(r => {
                  const u = mailInfos.displayNames.find(dn => dn[0] === r);
                  return u ? u[1] : I18n.t("unknown-user");
                })
                .join(", ")
              : mailInfos.displayNames.find(dn => dn[0] === mailInfos.from)[1]}
          </Author>
          <IconButton
            onPress={() => toggleVisible(!isVisible)}
            text={I18n.t("zimbra-see_detail")}
            color="#2A9CC8"
            icon={isVisible ? "keyboard_arrow_up" : "keyboard_arrow_down"}
          />
        </CenterPanel>
        {!isVisible ? (
          <Text>{moment(mailInfos.date).format("LL - LT")}</Text>
        ) : (
          <Text>{moment(mailInfos.date).format("dddd LL")}</Text>
        )}
      </Header>

      {isVisible && (
        <SendersDetails
          receivers={mailInfos.to}
          cc={mailInfos.cc}
          displayNames={mailInfos.displayNames}
          inInbox={inInbox}
          sender={mailInfos.from}
        />
      )}

      {mailInfos.subject && mailInfos.subject.length ? (
        <View style={{ flexDirection: "row" }}>
          <Text style={styles.greyColor}>{I18n.t("zimbra-subject")} : </Text>
          <TextBold> {mailInfos.subject}</TextBold>
        </View>
      ) : (
        <style.View />
      )}
    </View>
  );
};

export const FooterButton = ({ icon, text, onPress }) => {
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "space-evenly",
        marginBottom: 10,
      }}>
      <ButtonIcon
        name={icon}
        onPress={onPress}
        style={[{ backgroundColor: "white" }, styles.shadow]}
        color="black"
        colorText="#F4F7F9"
      />
      <Text>{text}</Text>
    </View>
  );
};

export const RenderPJs = ({ attachments, mailId, onDownload, dispatch }: { attachments: IDistantFile[], mailId: string, onDownload: (att: IDistantFile) => void, dispatch: ThunkDispatch<any, any, any> }) => {
  const [isVisible, toggleVisible] = React.useState(false);
  const displayedAttachments = isVisible ? attachments : attachments.slice(0, 1) as any;
  return (
    <View style={[styles.containerMail, { flexDirection: "column" }]}>
      {displayedAttachments.map((item, index) => {
        const df: IDistantFileWithId = {
          url: `/conversation/message/${mailId}/attachment/${item.id}`,
          id: item.id,
          filename: item.filename,
          filesize: item.size,
          filetype: item.contentType,
        }
        return (
          <TouchableOpacity
            onPress={() => {
              Trackers.trackEvent('Zimbra', 'DOWNLOAD ATTACHMENT');
              // console.log(df);
              onDownload(df);
            }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-around" }}>
              <Icon size={25} color="#2A9CC8" name={getFileIcon(item.contentType)} />
              <Text style={styles.gridButtonTextPJnames} key={item.id} numberOfLines={1} ellipsizeMode="middle">
                {item.filename}
              </Text>
              {index === 0 && (
                <TouchableOpacity onPress={() => toggleVisible(!isVisible)} style={{ padding: 5 }}>
                  {attachments.length > 1 && (
                    <Text style={styles.gridButtonTextPJnb}>
                      {isVisible ? "-" : "+"}
                      {attachments.length - 1}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
              {Platform.OS !== "ios" ? <TouchableOpacity onPress={async () => {
                try {
                  const sf = (await dispatch(downloadFileAction<SyncedFileWithId>(df, {}))) as unknown as SyncedFileWithId;
                  await sf.mirrorToDownloadFolder();
                  Toast.showSuccess(I18n.t("download-success-name", { name: sf.filename }));
                } catch (e) {
                  console.log(e);
                  Toast.show(I18n.t("download-error-generic"));
                }
              }}
                style={{ paddingHorizontal: 12, flex: 0 }}>
                <Icon name="download" size={18} color="#2A9CC8" />
              </TouchableOpacity> : null}
            </View>
          </TouchableOpacity>
        )
      })}
    </View>
  );
};

// STYLE

const styles = StyleSheet.create({
  containerMail: {
    padding: 15,
    backgroundColor: "white",
  },
  gridButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  gridButtonText: {
    color: "#2A9CC8",
    marginRight: 5,
  },
  gridButtonTextPJnb: {
    color: "#2A9CC8",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    textAlign: "right",
  },
  gridButtonTextPJnames: {
    color: "#2A9CC8",
    marginLeft: 5,
    paddingHorizontal: 24
  },
  dotReceiverColor: {
    width: 8,
    height: 8,
    borderRadius: 15,
    marginTop: 6,
    marginRight: 5,
  },
  greyColor: { color: "#AFAFAF" },
  shadow: {
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.8,
    marginBottom: 10,
  },
});
