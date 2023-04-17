import styled from '@emotion/native';
import { Picker } from '@react-native-picker/picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import * as React from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import theme from '~/app/theme';
import { ActionButton } from '~/framework/components/buttons/action';
import { UI_SIZES } from '~/framework/components/constants';
import { KeyboardPageView } from '~/framework/components/page';
import { Icon } from '~/framework/components/picture/Icon';
import { HeadingSText, SmallText } from '~/framework/components/text';
import { forgotAction } from '~/framework/modules/auth/actions';
import { AuthRouteNames, IAuthNavigationParams } from '~/framework/modules/auth/navigation';
import { containsKey } from '~/framework/util/object';
import { tryAction } from '~/framework/util/redux/actions';
import { TextInputLine } from '~/ui/forms/TextInputLine';
import { ValidatorBuilder } from '~/utils/form';

// TYPES ---------------------------------------------------------------------------

export type IForgotScreenState = {
  login: string;
  firstName?: string;
  structureName?: string;
  showStructurePicker: boolean;
  editing: boolean;
  structures: any[];
  result?: { ok: boolean; structures?: any[]; error?: string };
  forgotState: 'IDLE' | 'RUNNING' | 'DONE';
};
export interface IForgotPageEventProps {
  trySubmit: (...args: Parameters<typeof forgotAction>) => ReturnType<ReturnType<typeof forgotAction>>;
}
export type IForgotPageProps = IForgotPageEventProps & NativeStackScreenProps<IAuthNavigationParams, AuthRouteNames.forgot>;

// Forgot Page Component -------------------------------------------------------------

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

const styles = StyleSheet.create({
  keyboardAvoidingView: { backgroundColor: theme.ui.background.card },
  flexGrow1: { flexGrow: 1 },
  inputWrapper: {
    alignSelf: 'stretch',
    flex: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: UI_SIZES.spacing.small,
  },
  // inputLine: { color: theme.ui.text.inverse },
  touchable: { height: '100%', width: '100%', position: 'absolute' },
  picker: { width: '100%', borderWidth: 1, borderColor: theme.palette.grey.grey, borderTopWidth: 0 },
  textColorLight: { color: theme.ui.text.light },
  errorMsg: {
    flexGrow: 0,
    marginTop: UI_SIZES.spacing.medium,
    padding: UI_SIZES.spacing.tiny,
    textAlign: 'center',
    alignSelf: 'center',
    color: theme.palette.status.failure.regular,
  },
  infoMsg: {
    alignSelf: 'center',
    flexGrow: 0,
    marginTop: UI_SIZES.spacing.medium,
    padding: UI_SIZES.spacing.tiny,
    textAlign: 'center',
  },
  buttonWrapper: {
    alignItems: 'center',
    flexGrow: 2,
    justifyContent: 'flex-start',
  },
});

export class ForgotPage extends React.PureComponent<IForgotPageProps, IForgotScreenState> {
  // fully controlled component
  public state: IForgotScreenState = {
    login: '',
    showStructurePicker: false,
    editing: false,
    structures: [],
    forgotState: 'IDLE',
  };

  private doSubmit = async () => {
    try {
      this.setState({ editing: false, forgotState: 'RUNNING' });
      const { route } = this.props;
      const { login, firstName, structureName, structures } = this.state;
      const forgotMode = route.params.mode;
      const selectedStructure = structures && structures.find(structure => structure.structureName === structureName);
      const structureId = selectedStructure && selectedStructure.structureId;
      const result = await this.props.trySubmit(route.params.platform, { login, firstName, structureId }, forgotMode);
      this.setState({ editing: false, forgotState: 'DONE', result });
    } catch {
      this.setState({
        forgotState: 'IDLE',
        editing: false,
        result: undefined,
      });
    }
  };

  // Refs
  private inputLoginRef = React.createRef<TextInput>();

  private setInputLoginRef = (ref: TextInput) => (this.inputLoginRef.current = ref);

  // Email ValidatorBuilder
  private emailValidator = new ValidatorBuilder().withRequired(true).withEmail().build<string>();

  public componentDidUpdate(prevProps) {
    const { result } = this.state;
    if (result?.structures && !prevProps.result?.structures) {
      this.setState({ structures: result?.structures });
    }
  }

  public render() {
    const { route } = this.props;
    const { result, editing, login, firstName, structureName, showStructurePicker, structures } = this.state;
    const forgotMode = route.params.mode;
    const hasStructures = structures.length > 0;
    const isError = result && containsKey(result, 'error');
    const errorMsg = isError ? (result as { error: string }).error : null;
    const errorText = hasStructures
      ? I18n.t('forgot-several-emails')
      : errorMsg
      ? I18n.t(`forgot-${errorMsg.replace(/\./g, '-')}${forgotMode === 'id' ? '-id' : ''}`)
      : I18n.t('common-ErrorUnknown');
    const isSuccess =
      result &&
      !containsKey(result, 'error') &&
      !containsKey(result, 'structures') &&
      containsKey(result, 'ok') &&
      (result as { ok: boolean }).ok === true;
    const isValidEmail = this.emailValidator.isValid(login);
    const canSubmit =
      forgotMode === 'id' && hasStructures
        ? !firstName || !structureName || !login
        : !login || (forgotMode === 'id' && !isValidEmail) || (isError && !editing);

    return (
      <KeyboardPageView style={styles.keyboardAvoidingView}>
        <FormPage>
          <ScrollView
            alwaysBounceVertical={false}
            overScrollMode="never"
            contentContainerStyle={styles.flexGrow1}
            keyboardShouldPersistTaps="handled">
            <FormWrapper>
              <FormContainer>
                <LogoWrapper>
                  <HeadingSText style={styles.textColorLight}>
                    {I18n.t(`forgot-${forgotMode === 'id' ? 'id' : 'password'}`)}
                  </HeadingSText>
                  <SmallText style={styles.textColorLight}>
                    {I18n.t(`forgot-${forgotMode === 'id' ? 'id' : 'password'}-instructions`)}
                  </SmallText>
                </LogoWrapper>
                {!isSuccess ? (
                  <TextInputLine
                    inputRef={this.setInputLoginRef}
                    placeholder={I18n.t(forgotMode === 'id' ? 'Email' : 'Login')}
                    onChange={({ nativeEvent: { text } }) => {
                      this.setState({
                        login: text,
                        editing: true,
                      });
                    }}
                    value={login}
                    hasError={(isError && !editing && !(hasStructures && errorMsg)) ?? false}
                    keyboardType={forgotMode === 'id' ? 'email-address' : undefined}
                    editable={!hasStructures}
                    // inputStyle={hasStructures ? styles.inputLine : undefined}
                    returnKeyLabel={I18n.t('forgot-submit')}
                    returnKeyType="done"
                    onSubmitEditing={() => this.doSubmit()}
                    autoCapitalize="none"
                    autoCorrect={false}
                    spellCheck={false}
                  />
                ) : null}
                {(hasStructures && !isSuccess) || (isError && !editing) ? (
                  <SmallText style={styles.errorMsg}>{errorText}</SmallText>
                ) : null}
                {isSuccess ? (
                  <SmallText style={styles.infoMsg}>{editing ? '' : isSuccess && I18n.t(`forgot-success-${forgotMode}`)}</SmallText>
                ) : null}
                {forgotMode === 'id' && hasStructures && !isSuccess ? (
                  <>
                    <TextInputLine
                      inputRef={this.setInputLoginRef}
                      placeholder={I18n.t('Firstname')}
                      value={firstName}
                      hasError={(isError && !editing) ?? false}
                      onChange={({ nativeEvent: { text } }) => {
                        this.setState({
                          firstName: text,
                          editing: true,
                        });
                      }}
                    />
                    <View
                      style={[
                        styles.inputWrapper,
                        // Strangely, eslint considers this style is inline-defined.
                        // eslint-disable-next-line react-native/no-inline-styles
                        {
                          backgroundColor: structureName ? theme.palette.complementary.blue.regular : undefined,
                          borderBottomWidth: (isError && !editing) || showStructurePicker ? 2 : 0.9,
                          borderBottomColor:
                            isError && !editing
                              ? theme.palette.status.failure.regular
                              : showStructurePicker
                              ? theme.palette.complementary.blue.regular
                              : theme.palette.grey.grey,
                        },
                      ]}>
                      <TextInputLine
                        editable={false}
                        hasError={false}
                        inputRef={this.setInputLoginRef}
                        placeholder={I18n.t('School')}
                        value={structureName}
                        style={{ borderBottomWidth: undefined, borderBottomColor: undefined }}
                        // inputStyle={styles.inputLine}
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
                        style={styles.touchable}
                        onPress={() => this.setState({ showStructurePicker: !showStructurePicker })}
                      />
                    </View>
                    {showStructurePicker ? (
                      <Picker
                        selectedValue={structureName}
                        style={styles.picker}
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
                  style={[
                    styles.buttonWrapper,
                    {
                      marginTop: (isError || isSuccess) && !editing ? UI_SIZES.spacing.small : UI_SIZES.spacing.big,
                    },
                  ]}>
                  {!isSuccess || editing ? (
                    <ActionButton
                      action={() => this.doSubmit()}
                      disabled={canSubmit}
                      text={I18n.t('forgot-submit')}
                      loading={this.state.forgotState === 'RUNNING'}
                    />
                  ) : null}

                  {hasStructures && errorMsg ? (
                    <SmallText style={styles.errorMsg}>{I18n.t('forgot-several-emails-no-match')}</SmallText>
                  ) : null}
                </View>
              </FormContainer>
            </FormWrapper>
          </ScrollView>
        </FormPage>
      </KeyboardPageView>
    );
  }
}

export default connect(undefined, dispatch =>
  bindActionCreators<IForgotPageEventProps>(
    {
      trySubmit: tryAction(forgotAction),
    },
    dispatch,
  ),
)(ForgotPage);
