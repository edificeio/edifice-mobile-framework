import I18n from 'i18n-js';
import * as React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import { Icon } from '~/framework/components/picture';
import { Small, SmallBold, TextSizeStyle } from '~/framework/components/text';
import { FilePicker } from '~/infra/filePicker';
import { IApp, IEstablishment, ITicket } from '~/modules/support/containers/Support';
import { Attachment } from '~/modules/zimbra/components/Attachment';
import { PageContainer } from '~/ui/ContainerContent';

import { CategoryPicker, EstablishmentPicker, FormInput } from './Items';

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
  },
  scrollStyle: {
    flexGrow: 1,
  },
  textsContainer: {
    marginHorizontal: UI_SIZES.spacing.small,
    marginVertical: UI_SIZES.spacing.medium,
  },
  titleText: {
    ...TextSizeStyle.Medium,
    marginBottom: UI_SIZES.spacing.tiny,
  },
  informationText: {
    color: theme.palette.grey.graphite,
  },
  selectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: UI_SIZES.spacing.small,
    marginVertical: UI_SIZES.spacing.tiny,
  },
  selectionText: {
    width: '50%',
  },
  inputContainer: {
    marginHorizontal: UI_SIZES.spacing.small,
    marginVertical: UI_SIZES.spacing.medium,
  },
  mandatoryFieldText: {
    color: theme.palette.complementary.red.regular,
  },
  attachmentsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: UI_SIZES.spacing.small,
    marginTop: UI_SIZES.spacing.tiny,
    marginBottom: UI_SIZES.spacing.medium,
  },
  attachmentsIcon: {
    marginRight: UI_SIZES.spacing.tiny,
  },
  registerButtonContainer: {
    borderRadius: 5,
    marginHorizontal: UI_SIZES.spacing.small,
    marginVertical: UI_SIZES.spacing.medium,
  },
  registerButtonText: {
    color: theme.palette.grey.white,
    textAlign: 'center',
    margin: UI_SIZES.spacing.small,
  },
});

type SupportProps = {
  attachments: any;
  categoryList: IApp[];
  establishmentList: IEstablishment[];
  hasRightToCreateTicket: boolean;
  ticket: ITicket;
  onFieldChange: (ticket: ITicket) => void;
  removeAttachment: (attachmentId: string) => void;
  sendTicket: (reset: (() => void)[]) => void;
  uploadAttachment: () => void;
};

export default class Support extends React.PureComponent<SupportProps, any> {
  reset: (() => void)[] = [];

  componentDidMount() {
    const { categoryList, establishmentList, ticket, onFieldChange } = this.props;
    if (categoryList !== undefined && categoryList.length > 0 && establishmentList !== undefined && establishmentList.length > 0)
      onFieldChange({ ...ticket, category: categoryList[0].address, school_id: establishmentList[0].id });
    else {
      if (categoryList !== undefined && categoryList.length > 0) onFieldChange({ ...ticket, category: categoryList[0].address });
      if (establishmentList !== undefined && establishmentList.length > 0)
        onFieldChange({ ...ticket, school_id: establishmentList[0].id });
    }
  }

  renderFormSelect = (fieldTranslation, fieldName, list) => {
    const { onFieldChange, ticket } = this.props;
    return (
      <View style={styles.selectionContainer}>
        <SmallBold style={styles.selectionText}>{I18n.t(fieldTranslation)}</SmallBold>
        {fieldName === 'category' ? (
          <CategoryPicker list={list} onFieldChange={field => onFieldChange({ ...ticket, category: field })} />
        ) : (
          <EstablishmentPicker list={list} onFieldChange={field => onFieldChange({ ...ticket, school_id: field })} />
        )}
      </View>
    );
  };

  renderFormInput = (fieldTranslation, fieldName) => {
    const { onFieldChange, ticket } = this.props;
    const mandatory = '* ';
    return (
      <View style={styles.inputContainer}>
        <SmallBold style={styles.selectionText}>
          <SmallBold style={styles.mandatoryFieldText}>{mandatory}</SmallBold>
          {I18n.t(fieldTranslation)}
        </SmallBold>
        <FormInput
          fieldName={fieldName}
          setResetter={resetter => this.reset.push(resetter)}
          onChange={field => onFieldChange({ ...ticket, [fieldName]: field })}
        />
      </View>
    );
  };

  renderForm = () => {
    const { categoryList, establishmentList } = this.props;
    return (
      <View>
        {this.renderFormSelect('support-ticket-category', 'category', categoryList)}
        {this.renderFormSelect('support-ticket-establishment', 'school_id', establishmentList)}
        {this.renderFormInput('support-ticket-subject', 'subject')}
        {this.renderFormInput('support-ticket-description', 'description')}
      </View>
    );
  };

  renderAttachments = () => {
    return this.props.attachments.map(att => (
      <Attachment
        key={att.id || att.filename}
        name={att.name || att.filename}
        type={att.contentType}
        uploadSuccess={!!att.id}
        onRemove={() => this.props.removeAttachment(att.id)}
      />
    ));
  };

  public render() {
    const { hasRightToCreateTicket, ticket } = this.props;
    const isDisabled = ticket.subject === '' || ticket.description === '';
    const sendTicket = () => {
      this.props.sendTicket(this.reset);
    };
    if (!hasRightToCreateTicket) {
      return <EmptyScreen svgImage="empty-support" title={I18n.t('support-ticket-error-has-no-right')} />;
    }
    return (
      <PageContainer>
        <KeyboardAvoidingView
          enabled={Platform.OS === 'ios'}
          behavior="padding"
          keyboardVerticalOffset={60}
          style={styles.safeAreaContainer}>
          <ScrollView contentContainerStyle={styles.scrollStyle}>
            <View style={styles.textsContainer}>
              <SmallBold style={styles.titleText}>{I18n.t('support-report-incident')}</SmallBold>
              <Small style={styles.informationText}>{I18n.t('support-mobile-only')}</Small>
            </View>
            {this.renderForm()}
            <FilePicker multiple callback={this.props.uploadAttachment} style={styles.attachmentsContainer}>
              <Icon name="attachment" size={16} style={styles.attachmentsIcon} />
              <Small>{I18n.t('support-add-attachments')}</Small>
            </FilePicker>
            {this.props.attachments && this.props.attachments.length > 0 && this.renderAttachments()}
            <TouchableOpacity
              onPress={sendTicket}
              disabled={isDisabled}
              style={[
                styles.registerButtonContainer,
                { backgroundColor: isDisabled ? theme.palette.grey.stone : theme.palette.secondary.regular },
              ]}>
              <Small style={styles.registerButtonText}>{I18n.t('support-ticket-register').toUpperCase()}</Small>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </PageContainer>
    );
  }
}
