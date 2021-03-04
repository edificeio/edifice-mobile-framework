import I18n from "i18n-js";
import * as React from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import { CommonStyles } from "../../styles/common/styles";
import { Icon } from "../../ui";
import { PageContainer } from "../../ui/ContainerContent";

type SupportProps = {
  createTicket: () => void;
};

const IconButton = ({ icon, color, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Icon size={30} color={color} name={icon} />
    </TouchableOpacity>
  );
};

export default class Support extends React.PureComponent<any, any> {
  public render() {
    return (
      <PageContainer>
        <View style={styles.containerTitle}>
          <Text style={styles.textTitle}>{I18n.t("support-report-incident")}</Text>
          <IconButton icon="attachment" color="white" onPress={() => true} />
        </View>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <Text style={styles.textMobileOnly}>{I18n.t("support-mobile-only")}</Text>

          <View style={styles.lineSeparator} />
          <Text style={styles.textTicketFields}>{I18n.t("support-ticket-category")}</Text>

          <View style={styles.lineSeparator} />
          <Text style={styles.textTicketFields}>{I18n.t("support-ticket-establishment")}</Text>

          <View style={styles.lineSeparator} />
          <Text style={styles.textTicketFields}>
            <Text style={{ color: "red" }}>* </Text>
            {I18n.t("support-ticket-subject")}
          </Text>
          <TextInput numberOfLines={1} />

          <View style={styles.lineSeparator} />
          <Text style={styles.textTicketFields}>
            <Text style={{ color: "red" }}>* </Text>
            {I18n.t("support-ticket-description")}
          </Text>
          <TextInput numberOfLines={1} />

          <View style={{ height: 65 }} />
          <TouchableOpacity onPress={() => true} style={styles.buttonTicketRegister}>
            <Text style={styles.textButtonTicketRegister}>{I18n.t("support-ticket-register").toUpperCase()}</Text>
          </TouchableOpacity>
        </ScrollView>
      </PageContainer>
    );
  }
}

const styles = StyleSheet.create({
  containerTitle: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: CommonStyles.themeOpenEnt.cyan,
    padding: 10,
  },
  textTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  textMobileOnly: {
    color: "grey",
    fontSize: 15,
    padding: 10,
  },
  textTicketFields: {
    fontSize: 15,
    fontWeight: "bold",
    padding: 10,
  },
  lineSeparator: {
    marginVertical: 10,
    width: "100%",
    borderColor: CommonStyles.extraLightGrey,
    borderBottomWidth: 1,
    borderRadius: 1,
  },
  textInputStyle: {
    width: "100%",
    color: CommonStyles.textColor,
    borderBottomColor: "#EEEEEE",
    borderBottomWidth: 2,
  },
  buttonTicketRegister: {
    position: "absolute",
    alignSelf: "center",
    bottom: 10,
    width: "98%",
    backgroundColor: CommonStyles.secondary,
    borderRadius: 5,
    marginTop: 45,
    padding: 12,
  },
  textButtonTicketRegister: {
    color: "white",
    textAlign: "center",
  },
});
