import I18n from "i18n-js";
import moment from "moment";
import * as React from "react";
import { View, StyleSheet, TouchableWithoutFeedback } from "react-native";

import { Icon } from "../../../ui";
import { GridAvatars } from "../../../ui/avatars/GridAvatars";
import TouchableOpacity from "../../../ui/CustomTouchableOpacity";
import { getFileIcon } from "../utils/fileIcon";
import { getUserColor, getProfileColor } from "../utils/userColor";
import { displayPastDate } from "../../../framework/util/date";
import theme from "../../../framework/util/theme";
import { IDistantFileWithId, SyncedFileWithId } from "../../../framework/util/fileHandler";
import { ThunkDispatch } from "redux-thunk";
import { downloadFileAction } from "../../../framework/util/fileHandler/actions";
import { ListItem } from "../../../framework/components/listItem";
import { FontSize, LineHeight, NestedText, Text, TextSemiBold } from "../../../framework/components/text";

const User = ({ userId, userName }) => {
  const [dotColor, setDotColor] = React.useState(getProfileColor("Guest"));

  getUserColor(userId).then(setDotColor);

  return (
    <View style={{ flexDirection: "row", marginLeft: 4, alignItems: 'baseline' }} key={userId}>
      <View style={[styles.dotReceiverColor, { backgroundColor: dotColor }]} />
      <Text style={{ fontSize: FontSize.Small, lineHeight: LineHeight.Small }}>{userName}</Text>
    </View>
  );
};

const SendersDetails = ({ receivers, cc, cci, displayNames, inInbox, sender }) => {
  return (
    <View style={{ marginTop: 4 }}>
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

  let contacts = mailInfos.displayNames.filter(dn => mailInfos.to.includes(dn[0])) as Array<[string | undefined, string]>;
  if (contacts.length === 0) contacts = [[undefined, I18n.t("conversation.emptyTo")]];
  let contactFrom = mailInfos.displayNames.find(item => item[0] === mailInfos.from) as [string, string];
  let contactTo = contacts[0];
  let contactsToMore = contacts.length - 1;

  // console.log("mail infos in header", mailInfos);

  return <TouchableOpacity
    onPress={() => toggleVisible(!isVisible)}
    activeOpacity={1}
  ><ListItem
      style={{ paddingVertical: 18, borderBottomWidth: 0 }}

      leftElement={<View style={{ alignSelf: 'flex-start' }}><GridAvatars
        users={[contactFrom[0]]}
      /></View>}

      rightElement={<View style={styles.mailInfos}>
        <View style={{ flex: 0 }}>
          {/* Contact name */}
          <View style={{ flex: 0, flexDirection: 'row' }}>
            {(() => {
              const TextContactComponent = TextSemiBold;
              return <>
                <TextContactComponent
                  numberOfLines={1} style={{ flex: 1 }}
                >{contactFrom[1]}</TextContactComponent>
              </>
            })()}
            {/* Date */}
            <Text style={styles.mailDate} numberOfLines={1}>{displayPastDate(moment(mailInfos.date), isVisible)}</Text>
          </View>
        </View>
        <View style={{ flex: 0, flexDirection: 'row' }}>
          <View style={{ flex: 1 }}>
            {(() => {
              return isVisible ? (
                <SendersDetails
                  receivers={mailInfos.to}
                  cc={mailInfos.cc}
                  cci={mailInfos.cci}
                  displayNames={mailInfos.displayNames}
                  inInbox={isFolderInbox}
                  sender={mailInfos.from}
                />
              ) :
                <Text style={{ marginTop: 4, flex: 0, color: theme.color.text.regular, fontSize: FontSize.Small, lineHeight: LineHeight.Small }} numberOfLines={1}>
                  <NestedText style={{ color: styles.greyColor.color }}>{I18n.t('conversation.toPrefix') + ' '}</NestedText>
                  <NestedText style={{ color: theme.color.secondary.regular }}>
                    {contactTo[1]}
                    {contactsToMore > 0 ? I18n.t('conversation.toMore', { count: contactsToMore }) : null}
                  </NestedText>
                </Text>
            })()}
          </View>
          {/* Mail attachment indicator */}
          {mailInfos.attachments.length > 0 && (
            <View style={styles.mailIndicator}>
              <Icon name="attachment" size={16} color={theme.color.text.regular} />
            </View>
          )}
        </View>
      </View>}
    /></TouchableOpacity>;
};

export const FooterButton = ({ icon, text, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        alignItems: "center",
        justifyContent: "space-evenly"
      }}
    >
      <Icon name={icon} size={25} style={{ color: theme.color.neutral.regular }} />
      <Text style={{ color: theme.color.neutral.regular }}>{text}</Text>
    </TouchableOpacity>
  );
};

export const RenderPJs = ({ attachments, mailId, dispatch }: { attachments: any[], mailId: string, dispatch: ThunkDispatch<any, any, any> }) => {
  const [isVisible, toggleVisible] = React.useState(false);
  const displayedAttachments = isVisible ? attachments : attachments.slice(0, 1);
  // console.log("PJS", attachments);
  return (
    <View style={[styles.containerMail, { flexDirection: "column", flex: 0 }]}>
      {displayedAttachments.map((item, index) => (
        <TouchableOpacity
          style={{ flex: 0 }}
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
          <View style={{ flexDirection: "row", flex: 0, alignItems: "center", borderRadius: 6 }}>
            <Icon size={24} color="#2A9CC8" name={getFileIcon(item.contentType)} style={{ flex: 0 }}/>
            <Text style={styles.gridButtonTextPJnames} key={item.id} numberOfLines={1} ellipsizeMode="middle">
              {item.filename}
            </Text>
            {index === 0 && (
              <TouchableOpacity onPress={() => toggleVisible(!isVisible)} style={{ padding: 5, flex: 0 }}>
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
    backgroundColor: theme.color.background.card,
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
    flexShrink: 1,
  },
  dotReceiverColor: {
    width: 8,
    height: 8,
    borderRadius: 15,
    marginTop: 6,
    marginRight: 5,
  },
  greyColor: {
    color: "#AFAFAF",
    fontSize: FontSize.Small,
    lineHeight: LineHeight.Small
  },
  mailInfos: {
    paddingLeft: 12,
    flex: 1,
    alignSelf: 'flex-start'
  },
  mailDate: {
    minWidth: 66,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  mailIndicator: {
    flexDirection: 'row',
    textAlign: 'center',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    paddingTop: 6,
    paddingHorizontal: 12,
    flex: 0,
  }
});
