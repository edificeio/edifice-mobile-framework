import style from "glamorous-native";
import I18n from "i18n-js";
import moment from "moment";
import * as React from "react";
import { View, Dimensions, StyleSheet } from "react-native";

import { Icon } from "../../ui";
import { BadgeAvatar } from "../../ui/BadgeAvatar";
import { Header, CenterPanel, LeftPanel } from "../../ui/ContainerContent";
import TouchableOpacity from "../../ui/CustomTouchableOpacity";
import { Text, TextBold } from "../../ui/text";
import { findReceivers2, findReceiversAvatars, Author } from "./MailItem";

const SendersDetails = ({ receivers, cc, displayNames }) => {
  return (
    <View>
      <View style={{ flexDirection: "row" }}>
        <Text style={styles.greyColor}>{I18n.t("conversation-receiverPrefixInput")}</Text>
        {receivers.map(receiver => (
          <View style={{ flexDirection: "row", marginLeft: 5 }} key={receiver}>
            <View style={[styles.dotReceiverColor, { backgroundColor: "purple" }]} />
            <Text>{displayNames.find(item => item[0] === receiver)[1]}</Text>
          </View>
        ))}
      </View>
      {cc && (
        <View style={{ flexDirection: "row" }}>
          <Text style={styles.greyColor}>{I18n.t("zimbra-receiversCC")}</Text>
          {cc.map(person => (
            <View style={{ flexDirection: "row", marginLeft: 5 }} key={person}>
              <View style={[styles.dotReceiverColor, { backgroundColor: "orange" }]} />
              <Text>{displayNames.find(item => item[0] === person)[1]}</Text>
            </View>
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
  return (
    <View style={styles.containerMail}>
      <Header>
        <LeftPanel style={{ justifyContent: "flex-start" }}>
          <BadgeAvatar
            avatars={findReceiversAvatars(mailInfos.to, mailInfos.from, mailInfos.cc, mailInfos.displayNames)}
            badgeContent={mailInfos.unread}
          />
        </LeftPanel>

        <CenterPanel style={{ marginRight: 0, paddingRight: 0 }}>
          <Author nb={mailInfos.unread} numberOfLines={1}>
            {findReceivers2(mailInfos.to, mailInfos.from, mailInfos.cc)
              .map(r => {
                const u = mailInfos.displayNames.find(dn => dn[0] === r);
                return u ? u[1] : I18n.t("unknown-user");
              })
              .join(", ")}
          </Author>
          <IconButton
            onPress={() => toggleVisible(!isVisible)}
            text="Voir le détail"
            color="#2A9CC8"
            icon="arrow_down"
          />
        </CenterPanel>
        <Text>{moment(mailInfos.date).format("dddd LL")}</Text>
      </Header>

      {isVisible && <SendersDetails receivers={mailInfos.to} cc={mailInfos.cc} displayNames={mailInfos.displayNames} />}

      {mailInfos.subject && mailInfos.subject.length ? (
        <View style={{ flexDirection: "row" }}>
          <Text style={styles.greyColor}>{I18n.t("conversation-subjectPrefixInput")} </Text>
          <TextBold> {mailInfos.subject}</TextBold>
        </View>
      ) : (
        <style.View />
      )}
    </View>
  );
};

export const RenderPJs = ({ attachments }) => {
  const [isVisible, toggleVisible] = React.useState(false);
  return (
    <View style={[styles.containerMail, { flexDirection: "row" }]}>
      <TouchableOpacity onPress={() => toggleVisible(!isVisible)} style={styles.gridButton}>
        <Icon size={25} color="#2A9CC8" name="file-plus" />
        <Text style={styles.gridButtonText}>&emsp;{attachments[0].filename}</Text>
        {attachments.length > 1 && !isVisible && (
          <Text style={styles.gridButtonTextPJnb}>+{attachments.length - 1}</Text>
        )}
      </TouchableOpacity>
      {isVisible &&
        attachments.map(
          (item, index) =>
            index > 0 && (
              <Text style={styles.gridButtonTextPJnames} key={item.id}>
                {item.filename}
              </Text>
            )
        )}
    </View>
  );
};

// STYLE

const styles = StyleSheet.create({
  containerMail: {
    marginTop: 5,
    marginHorizontal: 5,
    maxWidth: Dimensions.get("window").width - 10,
    padding: 10,
    backgroundColor: "white",
  },
  gridButton: {
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  gridButtonText: {
    color: "#2A9CC8",
    marginRight: 5,
  },
  gridButtonTextPJnb: {
    color: "#2A9CC8",
    alignSelf: "flex-end",
  },
  gridButtonTextPJnames: {
    color: "#2A9CC8",
    marginLeft: 43,
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
