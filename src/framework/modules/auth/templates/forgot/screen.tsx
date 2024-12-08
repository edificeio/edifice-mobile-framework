import * as React from 'react';
import { View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import AlertCard from '~/framework/components/alert';
import PrimaryButton from '~/framework/components/buttons/primary';
import { UI_SIZES } from '~/framework/components/constants';
import InputContainer from '~/framework/components/inputs/container';
import TextInput from '~/framework/components/inputs/text';
import { KeyboardPageView } from '~/framework/components/page';
import { PFLogo } from '~/framework/components/pfLogo';
import { NamedSVG } from '~/framework/components/picture';
import { HeadingXSText, SmallText } from '~/framework/components/text';
import { forgotAction } from '~/framework/modules/auth/actions';
import { API } from '~/framework/modules/auth/service.ts';
import { containsKey } from '~/framework/util/object';
import { tryAction } from '~/framework/util/redux/actions';
import { ValidatorBuilder } from '~/utils/form';
import styles from './styles';
import { ForgotScreenPrivateProps, IForgotPageEventProps, IForgotScreenState } from './types';

const keyboardPageViewScrollViewProps = { bounces: false, showsVerticalScrollIndicator: false };

export const ForgotPage: React.FC<ForgotScreenPrivateProps> = (props: ForgotScreenPrivateProps) => {
  const { navigation, route } = props;
  const platform = route.params.platform;
  const [dropDownOpened, setDropDownOpened] = React.useState<boolean>(false);
  const [editing, setEditing] = React.useState<boolean>(false);
  const [firstName, setFirstName] = React.useState<string>('');
  const [forgotState, setForgotState] = React.useState<IForgotScreenState['forgotState']>('IDLE');
  const [login, setLogin] = React.useState<string>(route.params.login ?? '');
  const [result, setResult] = React.useState<API.AuthForgotResponse | undefined>(undefined);
  const [structures, setStructures] = React.useState<IForgotScreenState['structures']>([]);
  const [selectedSructureId, setSelectedSructureId] = React.useState<string>('');
  const selectedStructureName = React.useMemo(() => {
    return structures.find(structure => structure.structureId === selectedSructureId)?.structureName;
  }, [structures, selectedSructureId]);
  const dropdownItems = React.useMemo(() => {
    if (structures && structures.length > 0) {
      return structures.map(structure => ({
        key: structure.structureId,
        label: structure.structureName,
        value: structure.structureId,
      }));
    }
    return [];
  }, [structures]);
  const forgotMode = route.params.mode;
  const emailValidator = new ValidatorBuilder().withRequired(true).withEmail().build<string>();
  const isValidEmail = emailValidator.isValid(login);
  const hasStructures = structures.length > 0;
  const isError = React.useMemo(() => result && containsKey(result, 'error'), [result]);
  const errorMsg = React.useMemo(() => {
    if (isError && result) {
      return (result as { error: string }).error;
    }
    return undefined;
  }, [isError, result]);

  const canSubmit = React.useMemo(
    () =>
      forgotMode === 'password'
        ? !login || (isError && !editing)
        : !isValidEmail || (hasStructures && (!firstName || !selectedSructureId)),
    [forgotMode, login, isValidEmail, hasStructures, firstName, selectedSructureId],
  );

  const errorText = React.useMemo(() => {
    if (hasStructures) {
      return I18n.get('auth-forgot-severalemails');
    }
    if (errorMsg) {
      return I18n.get(`auth-forgot-${errorMsg.replace(/\./g, '')}${forgotMode === 'id' ? '-id' : ''}`);
    }
    return I18n.get('auth-forgot-error-unknown');
  }, [hasStructures, errorMsg, forgotMode]);

  const isSuccess = React.useMemo(() => {
    return (
      result &&
      !containsKey(result, 'error') &&
      !containsKey(result, 'structures') &&
      containsKey(result, 'ok') &&
      (result as { ok: boolean }).ok === true
    );
  }, [result]);
  const hasError = isError && !editing && !(hasStructures && errorMsg);

  const doSubmit = React.useCallback(async () => {
    try {
      setEditing(false);
      setForgotState('RUNNING');
      const submittedFirstName = firstName ?? '';
      const submitResult = await props.trySubmit(
        route.params.platform,
        { firstName, login, structureId: selectedSructureId },
        forgotMode,
      );
      const fetchedStructures = submitResult.structures ?? [];

      setEditing(false);
      setForgotState('DONE');
      setResult(submitResult);
      setStructures(fetchedStructures);
      setSelectedSructureId(selectedSructureId);
      setFirstName(submittedFirstName);
    } catch (e) {
      console.error(e);
      setEditing(false);
      setForgotState('IDLE');
      setResult(undefined);
    }
  }, [firstName, props.trySubmit, route.params.platform, login, selectedSructureId, forgotMode]);

  const handleInputChange = React.useCallback((field: string, value: string) => {
    setEditing(true);
    field === 'login' ? setLogin(value) : setFirstName(value);
  }, []);

  const toggleDropDown = React.useCallback((open: (prevState: boolean) => boolean): void => {
    setDropDownOpened(open);
  }, []);

  const setCurrentStructure: typeof setSelectedSructureId = React.useCallback(structureId => {
    setEditing(true);
    setSelectedSructureId(structureId);
  }, []);

  const renderButtons = React.useCallback(() => {
    if (!isSuccess || editing) {
      return (
        <PrimaryButton
          action={() => doSubmit()}
          disabled={canSubmit}
          text={I18n.get('auth-forgot-submit')}
          loading={forgotState === 'RUNNING'}
        />
      );
    }
    if (isSuccess && !editing) {
      return <PrimaryButton action={() => navigation.goBack()} text={I18n.get('auth-forgot-connect')} />;
    }
    return null;
  }, [isSuccess, editing, doSubmit, canSubmit, forgotState, navigation]);

  const renderInputLogin = React.useCallback(() => {
    return (
      <InputContainer
        style={styles.inputContainer}
        label={{
          icon: forgotMode === 'id' ? 'ui-mail' : 'ui-user',
          text: forgotMode === 'id' ? I18n.get('auth-forgot-email') : I18n.get('auth-forgot-login'),
        }}
        input={
          <TextInput
            annotation={hasError ? errorText : I18n.get('common-space')}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!hasStructures}
            keyboardType={forgotMode === 'id' ? 'email-address' : undefined}
            onChange={({ nativeEvent: { text } }) => handleInputChange('login', text)}
            onSubmitEditing={() => doSubmit()}
            placeholder={I18n.get(forgotMode === 'id' ? 'auth-forgot-email-placeholder' : 'auth-forgot-login-placeholder')}
            returnKeyLabel={I18n.get('auth-forgot-submit')}
            returnKeyType="done"
            showError={hasError}
            showIconCallback
            spellCheck={false}
            value={login}
          />
        }
      />
    );
  }, [forgotMode, hasError, errorText, login]);

  const renderInputFirstnameWithStructurePicker = React.useCallback(() => {
    if (forgotMode === 'id' && hasStructures)
      return (
        <>
          <InputContainer
            label={{
              icon: 'ui-user',
              text: I18n.get('auth-forgot-firstname'),
            }}
            input={
              <TextInput
                annotation={hasError ? errorText : I18n.get('common-space')}
                autoCapitalize="none"
                autoCorrect={false}
                onChange={({ nativeEvent: { text } }) => {
                  handleInputChange('firstName', text);
                }}
                onSubmitEditing={() => !canSubmit && doSubmit()}
                returnKeyLabel={I18n.get('auth-forgot-submit')}
                returnKeyType="done"
                placeholder={I18n.get('auth-forgot-firstname-placeholder')}
                showError={hasError}
                spellCheck={false}
                value={firstName}
              />
            }
          />
          <InputContainer
            label={{
              icon: 'ui-school',
              text: I18n.get('auth-forgot-school'),
              labelStyle: styles.dropDownLabel,
            }}
            style={{ justifyContent: 'center' }}
            input={
              <View style={styles.dropDownContainer}>
                <DropDownPicker
                  dropDownContainerStyle={styles.dropdownItems}
                  items={dropdownItems}
                  open={dropDownOpened}
                  placeholder={selectedStructureName ? selectedStructureName : I18n.get('auth-forgot-structure')}
                  placeholderStyle={styles.dropDownPlaceholder}
                  setOpen={toggleDropDown}
                  setValue={setCurrentStructure}
                  showTickIcon={false}
                  style={styles.dropdownInput}
                  textStyle={styles.dropDownText}
                  value={selectedSructureId}
                  ArrowDownIconComponent={() => (
                    <NamedSVG name="ui-rafterDown" fill={theme.palette.grey.black} style={styles.dropDownArrow} />
                  )}
                  ArrowUpIconComponent={() => (
                    <NamedSVG name="ui-rafterUp" fill={theme.palette.grey.black} style={styles.dropDownArrow} />
                  )}
                  arrowIconContainerStyle={styles.dropDownArrowContainer}
                />
              </View>
            }
          />
        </>
      );
  }, [
    forgotMode,
    hasStructures,
    hasError,
    errorText,
    canSubmit,
    firstName,
    dropdownItems,
    dropDownOpened,
    selectedStructureName,
    selectedSructureId,
    theme,
  ]);

  const renderInstructions = React.useCallback(() => {
    if (!isSuccess)
      return (
        <SmallText style={styles.instructions}>
          {I18n.get(forgotMode === 'id' ? 'auth-forgot-id-instructions' : 'auth-forgot-password-instructions')}
        </SmallText>
      );
  }, [isSuccess, forgotMode]);

  const renderMultiAccountInfo = React.useCallback(() => {
    if ((hasStructures && !isSuccess) || (isError && !editing))
      return <AlertCard type="info" text={errorText} style={styles.alertCard} />;
  }, [hasStructures, isSuccess, isError, editing]);

  const renderPlatform = React.useCallback(() => {
    const logoStyle = {
      ...styles.platformLogo,
    };
    if (platform.logoStyle) Object.assign(logoStyle, platform.logoStyle);
    return (
      <View style={styles.platform}>
        <PFLogo pf={platform} />
        <HeadingXSText style={styles.platformName}>{platform.displayName}</HeadingXSText>
      </View>
    );
  }, [platform]);

  const renderSuccessMessage = React.useCallback(() => {
    if (isSuccess)
      return editing
        ? ''
        : isSuccess && (
            <AlertCard type="info" text={I18n.get(`auth-forgot-success-${forgotMode}`)} style={styles.alertCardSuccess} />
          );
  }, [isSuccess, editing, forgotMode]);

  const renderNoMatchError = React.useCallback(() => {
    if (hasStructures && errorMsg)
      return <SmallText style={styles.errorMsg}>{I18n.get('auth-forgot-severalemails-nomatch')}</SmallText>;
  }, [hasStructures, errorMsg]);

  return (
    <KeyboardPageView scrollable scrollViewProps={keyboardPageViewScrollViewProps} safeArea style={styles.page}>
      <View style={styles.infos}>
        {renderPlatform()}
        {renderInstructions()}
      </View>
      {renderInputLogin()}
      {renderMultiAccountInfo()}
      {renderSuccessMessage()}
      {renderInputFirstnameWithStructurePicker()}
      <View
        style={[
          styles.buttonWrapper,
          {
            marginTop: (isError || isSuccess) && !editing ? UI_SIZES.spacing.small : UI_SIZES.spacing.big,
          },
        ]}>
        {renderButtons()}
        {renderNoMatchError()}
      </View>
    </KeyboardPageView>
  );
};

export default connect(undefined, dispatch =>
  bindActionCreators<IForgotPageEventProps>({ trySubmit: tryAction(forgotAction) }, dispatch),
)(ForgotPage);
