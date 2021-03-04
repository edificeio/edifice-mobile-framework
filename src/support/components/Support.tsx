import I18n from "i18n-js";
import * as React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import { CommonStyles } from "../../styles/common/styles";
import { PageContainer } from "../../ui/ContainerContent";
import { IApp, IEstablishment, ITicket } from "../containers/Support";
import Attachment from "./Attachment";
import { CategoryPicker, EstablishmentPicker, FormInputs, IconButton } from "./Items";
import Toast from "react-native-tiny-toast";

type SupportProps = {
  ticket: ITicket;
  attachments: any;
  onFieldChange: (ticket: ITicket) => void;
  uploadAttachment: () => void;
  removeAttachment: (attachmentId: string) => void;
  sendTicket: (reset: (() => void)[]) => void;
  categoryList: IApp[];
  establishmentList: IEstablishment[];
  hasRightToCreateTicket: boolean;
};

export default class Support extends React.PureComponent<SupportProps, any> {
  reset: (() => void)[] = [];

  componentDidMount() {
    const { categoryList, establishmentList, ticket, onFieldChange, hasRightToCreateTicket } = this.props;
    if (
      categoryList !== undefined &&
      categoryList.length > 0 &&
      establishmentList !== undefined &&
      establishmentList.length > 0
    )
      onFieldChange({ ...ticket, category: categoryList[0].address, school_id: establishmentList[0].id });
    else {
      if (categoryList !== undefined && categoryList.length > 0) onFieldChange({ ...ticket, category: categoryList[0].address });
      if (establishmentList !== undefined && establishmentList.length > 0)
        onFieldChange({ ...ticket, school_id: establishmentList[0].id });
    }
  }

  renderAttachments = () => {
    return this.props.attachments.map(att => (
      <Attachment
        id={att.id || att.filename}
        uploadSuccess={!!att.id}
        fileType={att.contentType}
        fileName={att.name || att.filename}
        onRemove={() => this.props.removeAttachment(att.id)}
      />
    ));
  };

  renderFormInput = (fieldTranslation, fieldName) => {
    const { onFieldChange, ticket } = this.props;
    return (
      <>
        <View style={styles.lineSeparator} />
        <Text style={styles.textTicketFields}>
          <Text style={{ color: "red" }}>* </Text>
          {I18n.t(fieldTranslation)}
        </Text>
        <FormInputs fieldName={fieldName} setResetter={resetter => this.reset.push(resetter)} onChange={field => onFieldChange({ ...ticket, [fieldName]: field })} />
      </>
    );
  };

  sendTicket = () => {
    this.props.sendTicket(this.reset)
  }

  hasNoRight = () => {
    Toast.show(I18n.t("support-ticket-error-has-no-right"), {
      position: Toast.position.BOTTOM,
      mask: false,
      containerStyle: { width: "95%", backgroundColor: "black" },
    });
  }

  renderFormSelect = (fieldTranslation, fieldName, list) => {
    const { onFieldChange, ticket } = this.props;
    return (
      <>
        <View style={styles.lineSeparator} />
        <View style={styles.containerFieldsSelect}>
          <Text style={styles.textTicketFields}>{I18n.t(fieldTranslation)}</Text>
          {fieldName === "category" && (
            <CategoryPicker list={list} onFieldChange={field => onFieldChange({ ...ticket, category: field })} />
          )}
          {fieldName === "school_id" && (
            <EstablishmentPicker list={list} onFieldChange={field => onFieldChange({ ...ticket, school_id: field })} />
          )}
        </View>
      </>
    );
  };

  renderForm = () => {
    const { categoryList, establishmentList, hasRightToCreateTicket } = this.props;
    return (
        // @ts-ignore
        <View onTouchStart={ !hasRightToCreateTicket && (() => this.hasNoRight())}>
            {this.renderFormSelect("support-ticket-category", "category", categoryList)}
            {this.renderFormSelect("support-ticket-establishment", "school_id", establishmentList)}
            {this.renderFormInput("support-ticket-subject", "subject")}
            {this.renderFormInput("support-ticket-description", "description")}
          </View>
      );
  };

  public render() {
    return (
      <PageContainer>
        <View style={styles.containerTitle}>
          <Text style={styles.textTitle}>{I18n.t("support-report-incident")}</Text>
          <IconButton icon="attachment" color={this.props.hasRightToCreateTicket ? "white" : CommonStyles.fadColor}
                      onPress={this.props.hasRightToCreateTicket ? () => this.props.uploadAttachment() : () => this.hasNoRight()} />
        </View>
        <KeyboardAvoidingView enabled={Platform.OS === "ios"} behavior="position" keyboardVerticalOffset={80} style={{overflow:'hidden'}}>
          <ScrollView bounces={false} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="never"
                      contentContainerStyle={{ flexGrow: 1 }}>
            <Text style={styles.textMobileOnly}>{I18n.t("support-mobile-only")}</Text>
            {this.renderForm()}
            {this.props.attachments && this.props.attachments.length > 0 && this.renderAttachments()}
            <View style={{ height: 65 }} />
            <TouchableOpacity onPress={this.props.hasRightToCreateTicket ? this.sendTicket : this.hasNoRight}
                              style={this.props.hasRightToCreateTicket ? styles.buttonTicketRegister : styles.buttonTicketRegisterDisabled}>
              <Text style={styles.textButtonTicketRegister}>{I18n.t("support-ticket-register").toUpperCase()}</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
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
  containerFieldsSelect: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginRight: 10,
  },
  textTicketFields: {
    width: "50%",
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
  buttonTicketRegisterDisabled: {
    position: "absolute",
    alignSelf: "center",
    bottom: 10,
    width: "98%",
    backgroundColor: CommonStyles.fadColor,
    borderRadius: 5,
    marginTop: 45,
    padding: 12,
  },
  textButtonTicketRegister: {
    color: "white",
    textAlign: "center",
  },
});
