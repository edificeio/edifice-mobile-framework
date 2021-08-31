import style from "glamorous-native";
import I18n from "i18n-js";
import moment from "moment";
import * as React from "react";
import { View, StyleSheet } from "react-native";

import { Icon } from "../../../ui";
import { GridAvatars } from "../../../ui/avatars/GridAvatars";
import { Header, CenterPanel, LeftPanel } from "../../../ui/ContainerContent";
import TouchableOpacity from "../../../ui/CustomTouchableOpacity";
import { Text, TextBold } from "../../../ui/text";
import { getFileIcon } from "../utils/fileIcon";
import { getUserColor, getProfileColor } from "../utils/userColor";
import { findReceivers2, findReceiversAvatars, Author, findSenderAvatar } from "./MailItem";
import { displayPastDate } from "../../../framework/util/date";
import theme from "../../../framework/util/theme";
import { IDistantFileWithId, SyncedFileWithId } from "../../../framework/util/fileHandler";
import { ThunkDispatch } from "redux-thunk";
import { downloadFileAction } from "../../../framework/util/fileHandler/actions";

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

const SendersDetails = ({ receivers, cc, cci, displayNames, inInbox, sender }) => {
  return (
    <View>
      {inInbox || (
        <View style={{ flexDirection: "row" }}>
          <Text style={styles.greyColor}>{I18n.t("conversation.fromPrefix")}</Text>
          <User userId={sender} userName={displayNames.find(item => item[0] === sender)[1]} />
        </View>
      )}
      <View style={{ flexDirection: "row" }}>
        <Text style={styles.greyColor}>{I18n.t("conversation.toPrefix")}</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {receivers.map(receiver => (
            <User userId={receiver} userName={displayNames.find(item => item[0] === receiver)[1]} />
          ))}
        </View>
      </View>
      {cc && cc.length > 0 && (
        <View style={{ flexDirection: "row" }}>
          <Text style={styles.greyColor}>{I18n.t("conversation.ccPrefix")}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {cc.map(person => (
              <User userId={person} userName={displayNames.find(item => item[0] === person)[1]} />
            ))}
          </View>
        </View>
      )}
      {cci && cci.length > 0 && (
        <View style={{ flexDirection: "row" }}>
          <Text style={styles.greyColor}>{I18n.t("conversation.bccPrefix")}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {cci.map(person => (
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

// EXPORTED COMPONENTS

export const HeaderMail = ({ mailInfos, currentFolder }) => {
  const [isVisible, toggleVisible] = React.useState(false);
  const isFolderInbox = currentFolder === "inbox";
  const isFolderOutboxOrDraft = currentFolder === "sendMessages" || currentFolder === "drafts";
  return (
    <View style={styles.containerMail}>
      <Header>
        <LeftPanel style={{ justifyContent: "flex-start" }}>
          <GridAvatars
            users={
              isFolderOutboxOrDraft
                ? findReceiversAvatars(mailInfos.to, mailInfos.from, mailInfos.cc, mailInfos.displayNames)
                : findSenderAvatar(mailInfos.from, mailInfos.displayNames)
            }
          />
        </LeftPanel>

        <CenterPanel style={{ marginRight: 0, paddingRight: 0 }}>
          <Author numberOfLines={1}>
            {isFolderOutboxOrDraft
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
            text={I18n.t("conversation.seeDetail")}
            color="#2A9CC8"
            icon={isVisible ? "keyboard_arrow_up" : "keyboard_arrow_down"}
          />
        </CenterPanel>
        {!isVisible ? (
          <Text>{displayPastDate(moment(mailInfos.date))}</Text>
        ) : (
          <Text>{displayPastDate(moment(mailInfos.date), true)}</Text>
        )}
      </Header>

      {isVisible && (
        <SendersDetails
          receivers={mailInfos.to}
          cc={mailInfos.cc}
          cci={mailInfos.cci}
          displayNames={mailInfos.displayNames}
          inInbox={isFolderInbox}
          sender={mailInfos.from}
        />
      )}

      {mailInfos.subject && mailInfos.subject.length ? (
        <View style={{ flexDirection: "row" }}>
          <Text style={styles.greyColor}>{I18n.t("conversation.subject")} : </Text>
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
    <TouchableOpacity
      onPress={onPress}
      style={{
        alignItems: "center",
        justifyContent: "space-evenly",
        marginBottom: 10,
      }}
    >
      <Icon name={icon} size={25} style={{ color: theme.color.tertiary.regular }} />
      <Text style={{ color: theme.color.tertiary.regular }}>{text}</Text>
    </TouchableOpacity>
  );
};

export const RenderPJs = ({ attachments, mailId, dispatch }: { attachments: any[], mailId: string, dispatch: ThunkDispatch<any, any, any> }) => {
  const [isVisible, toggleVisible] = React.useState(false);
  const displayedAttachments = isVisible ? attachments : attachments.slice(0, 1);
  // console.log("PJS", attachments);
  return (
    <View style={[styles.containerMail, { flexDirection: "column" }]}>
      {displayedAttachments.map((item, index) => (
        <TouchableOpacity
          onPress={async () => {
            const df: IDistantFileWithId = {
              url: `/conversation/message/${mailId}/attachment/${item.id}`,
              id: item.id,
              filename: item.filename,
              filesize: item.size,
              filetype: item.contentType,
            }
            // console.log("df", df, dispatch);
            const sf = (await dispatch(downloadFileAction<SyncedFileWithId>(df, {}))) as unknown as SyncedFileWithId;
            // console.log("sf", sf);
            await sf.open();
          }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Icon size={25} color="#2A9CC8" name={getFileIcon(item.contentType)} />
            <Text style={styles.gridButtonTextPJnames} key={item.id}>
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
          </View>
        </TouchableOpacity>
      ))}
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
    flexGrow: 1,
  },
  dotReceiverColor: {
    width: 8,
    height: 8,
    borderRadius: 15,
    marginTop: 6,
    marginRight: 5,
  },
  greyColor: { color: "#AFAFAF" },
});
