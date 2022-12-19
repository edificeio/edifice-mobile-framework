import styled from '@emotion/native';
import { Picker } from '@react-native-picker/picker';
import I18n from 'i18n-js';
import * as React from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { ActionButton } from '~/framework/components/action-button';
import { UI_SIZES } from '~/framework/components/constants';
import { PageView } from '~/framework/components/page';
import { Icon } from '~/framework/components/picture/Icon';
import { HeadingSText, SmallText } from '~/framework/components/text';
import { TextInputLine } from '~/ui/forms/TextInputLine';
import { IForgotModel } from '~/user/actions/forgot';
import { ValidatorBuilder } from '~/utils/form';

// TYPES ---------------------------------------------------------------------------

export type IForgotPageState = {
  login: string;
  firstName: string | null;
  structureName: string | null;
  showStructurePicker: boolean;
  editing: boolean;
  structures: any[];
};
export interface IForgotPageDataProps {
  fetching: boolean;
  result: { error?: string; status?: string; structures?: any[]; ok: boolean | undefined };
}
export interface IForgotPageEventProps {
  onSubmit(model: IForgotModel, forgotId?: boolean): Promise<void>;
  onReset(): Promise<void>;
}
export type IForgotPageProps = IForgotPageDataProps & IForgotPageEventProps & { navigation: any };

// Forgot Page Component -------------------------------------------------------------

export class ForgotPage extends React.PureComponent<IForgotPageProps, IForgotPageState> {
  // fully controller component
  public state: IForgotPageState = {
    login: '',
    firstName: null,
    structureName: null,
    showStructurePicker: false,
    editing: false,
    structures: [],
  };
  private handleSubmit = async () => {
    const { navigation } = this.props;
    const { login, firstName, structureName, structures } = this.state;
    const forgotId = navigation.getParam('forgotId');
    const selectedStructure = structures && structures.find(structure => structure.structureName === structureName);
    const structureId = selectedStructure && selectedStructure.structureId;

    this.props.onSubmit({ login, firstName, structureId }, forgotId);
    this.setState({ editing: false });
  };

  // Refs
  private setInputLoginRef = el => (this.inputLogin = el);

  private didFocusSubscription;

  // Email ValidatorBuilder
  private emailValidator = new ValidatorBuilder().withRequired(true).withEmail().build<string>();

  constructor(props: IForgotPageProps) {
    super(props);
    this.didFocusSubscription = this.props.navigation.addListener('didFocus', payload => {
      this.setState({
        login: '',
        editing: false,
        firstName: null,
        structureName: null,
        showStructurePicker: false,
        structures: [],
      });
      this.props.onReset();
    });
  }

  public componentDidUpdate(prevProps) {
    const { result } = this.props;
    if (result?.structures && !prevProps.result?.structures) {
      this.setState({ structures: result?.structures });
    }
  }

  public render() {
    const { fetching, result, navigation } = this.props;
    const { editing, login, firstName, structureName, showStructurePicker, structures } = this.state;
    const forgotId = navigation.getParam('forgotId');
    const hasStructures = structures.length > 0;
    const isError = result.hasOwnProperty('error');
    const errorMsg = isError ? (result as { error: string }).error : null;
    const errorText = hasStructures
      ? I18n.t('forgot-several-emails')
      : errorMsg
      ? I18n.t(`forgot-${errorMsg.replace(/\./g, '-')}${forgotId ? '-id' : ''}`)
      : I18n.t('common-ErrorUnknown');
    const isSuccess =
      !result.hasOwnProperty('error') &&
      !result.hasOwnProperty('structures') &&
      result.hasOwnProperty('ok') &&
      (result as { ok: boolean }).ok === true;
    const isValidEmail = this.emailValidator.isValid(login);
    const canSubmit =
      forgotId && hasStructures
        ? !firstName || !structureName || !login
        : !login || (forgotId && !isValidEmail) || (isError && !editing);

    return (
      <PageView
        navigation={navigation}
        navBarWithBack={{
          title: I18n.t(`forgot-${forgotId ? 'id' : 'password'}`),
        }}>
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.ui.background.card }}>
          <FormPage>
            <KeyboardAvoidingView
              style={{ flex: 1, backgroundColor: theme.ui.background.card }}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <ScrollView alwaysBounceVertical={false} overScrollMode="never" contentContainerStyle={{ flexGrow: 1 }}>
                <FormWrapper>
                  <FormContainer>
                    <LogoWrapper>
                      <HeadingSText style={{ color: theme.ui.text.light }}>
                        {I18n.t(`forgot-${forgotId ? 'id' : 'password'}`)}
                      </HeadingSText>
                      <SmallText style={{ color: theme.ui.text.light }}>
                        {I18n.t(`forgot-${forgotId ? 'id' : 'password'}-instructions`)}
                      </SmallText>
                    </LogoWrapper>
                    {!isSuccess ? (
                      <TextInputLine
                        inputRef={this.setInputLoginRef}
                        placeholder={I18n.t(forgotId ? 'Email' : 'Login')}
                        onChange={({ nativeEvent: { text } }) => {
                          this.setState({
                            login: text,
                            editing: true,
                          });
                        }}
                        value={login}
                        hasError={isError && !editing && !(hasStructures && errorMsg)}
                        keyboardType={forgotId ? 'email-address' : undefined}
                        editable={!hasStructures}
                        returnKeyLabel={I18n.t('forgot-submit')}
                        returnKeyType="done"
                        onSubmitEditing={() => this.handleSubmit()}
                        autoCapitalize="none"
                        autoCorrect={false}
                        spellCheck={false}
                      />
                    ) : null}
                    {(hasStructures && !isSuccess) || (isError && !editing) ? (
                      <SmallText
                        style={{
                          flexGrow: 0,
                          marginTop: UI_SIZES.spacing.medium,
                          padding: UI_SIZES.spacing.tiny,
                          textAlign: 'center',
                          alignSelf: 'center',
                          color: theme.palette.status.failure,
                        }}>
                        {errorText}
                      </SmallText>
                    ) : null}
                    {isSuccess ? (
                      <SmallText
                        style={{
                          alignSelf: 'center',
                          flexGrow: 0,
                          marginTop: UI_SIZES.spacing.medium,
                          padding: UI_SIZES.spacing.tiny,
                          textAlign: 'center',
                        }}>
                        {editing ? '' : isSuccess && I18n.t(`forgot-success-${forgotId ? 'id' : 'password'}`)}
                      </SmallText>
                    ) : null}
                    {forgotId && hasStructures && !isSuccess ? (
                      <>
                        <TextInputLine
                          inputRef={this.setInputLoginRef}
                          placeholder={I18n.t('Firstname')}
                          value={firstName}
                          hasError={isError && !editing}
                          onChange={({ nativeEvent: { text } }) => {
                            this.setState({
                              firstName: text,
                              editing: true,
                            });
                          }}
                        />
                        <View
                          style={{
                            alignSelf: 'stretch',
                            flex: 0,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingRight: UI_SIZES.spacing.small,
                            backgroundColor: structureName ? theme.palette.complementary.blue.regular : undefined,
                            borderBottomWidth: (isError && !editing) || showStructurePicker ? 2 : 0.9,
                            borderBottomColor:
                              isError && !editing
                                ? theme.palette.status.failure
                                : showStructurePicker
                                ? theme.palette.complementary.blue.regular
                                : theme.palette.grey.grey,
                          }}>
                          <TextInputLine
                            editable={false}
                            hasError={false}
                            inputRef={this.setInputLoginRef}
                            placeholder={I18n.t('School')}
                            value={structureName}
                            style={{ borderBottomWidth: undefined, borderBottomColor: undefined }}
                            inputStyle={{ color: theme.ui.text.inverse }}
                          />
                          <Icon
                            name="arrow_down"
                            color={structureName ? theme.ui.text.inverse : theme.palette.grey.black}
                            style={[
                              { marginTop: UI_SIZES.spacing.small },
                              showStructurePicker && { transform: [{ rotate: '180deg' }] },
                            ]}
                          />
                          <TouchableOpacity
                            style={{ height: '100%', width: '100%', position: 'absolute' }}
                            onPress={() => this.setState({ showStructurePicker: !showStructurePicker })}
                          />
                        </View>
                        {showStructurePicker ? (
                          <Picker
                            selectedValue={structureName}
                            style={{ width: '100%', borderWidth: 1, borderColor: theme.palette.grey.grey, borderTopWidth: 0 }}
                            onValueChange={itemValue => this.setState({ structureName: itemValue, editing: true })}>
                            <Picker.Item label="" value={null} />
                            {structures &&
                              structures.map(structure => (
                                <Picker.Item label={structure.structureName} value={structure.structureName} />
                              ))}
                          </Picker>
                        ) : null}
                      </>
                    ) : null}
                    <View
                      style={{
                        alignItems: 'center',
                        flexGrow: 2,
                        justifyContent: 'flex-start',
                        marginTop: (isError || isSuccess) && !editing ? UI_SIZES.spacing.small : UI_SIZES.spacing.big,
                      }}>
                      {!isSuccess || editing ? (
                        <ActionButton
                          text={I18n.t('forgot-submit')}
                          disabled={canSubmit}
                          action={() => this.handleSubmit()}
                          loading={fetching}
                        />
                      ) : null}
                      {hasStructures && errorMsg ? (
                        <SmallText
                          style={{
                            flexGrow: 0,
                            marginTop: UI_SIZES.spacing.medium,
                            padding: UI_SIZES.spacing.tiny,
                            textAlign: 'center',
                            alignSelf: 'center',
                            color: theme.palette.status.failure,
                          }}>
                          {I18n.t('forgot-several-emails-no-match')}
                        </SmallText>
                      ) : null}
                    </View>
                  </FormContainer>
                </FormWrapper>
              </ScrollView>
            </KeyboardAvoidingView>
          </FormPage>
        </SafeAreaView>
      </PageView>
    );
  }
}

const FormPage = styled.View({
  backgroundColor: theme.ui.background.card,
  flex: 1,
});
const FormWrapper = styled.View({ flex: 1 });
const FormContainer = styled.View({
  alignItems: 'center',
  flex: 1,
  flexDirection: 'column',
  justifyContent: 'center',
  padding: UI_SIZES.spacing.large,
  paddingTop: UI_SIZES.spacing.huge,
});
const LogoWrapper = styled.View({
  flexGrow: 2,
  alignItems: 'center',
  justifyContent: 'center',
});
