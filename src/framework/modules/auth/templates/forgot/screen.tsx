import * as React from 'react';
import { View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { I18n } from '~/app/i18n';
import PrimaryButton from '~/framework/components/buttons/primary';
import { UI_SIZES } from '~/framework/components/constants';
import InputContainer from '~/framework/components/inputs/container';
import { LabelIndicator } from '~/framework/components/inputs/container/label';
import TextInput from '~/framework/components/inputs/text';
import { KeyboardPageView } from '~/framework/components/page';
import { NamedSVG } from '~/framework/components/picture';
import { SmallText } from '~/framework/components/text';
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
  const isError = result && containsKey(result, 'error');
  const errorMsg = isError ? (result as { error: string }).error : null;
  const canSubmit =
    forgotMode === 'id' && hasStructures
      ? !firstName || !selectedStructureName || !login
      : !login || (forgotMode === 'id' && !isValidEmail) || (isError && !editing);
  const errorText = hasStructures
    ? I18n.get('auth-forgot-severalemails')
    : errorMsg
      ? I18n.get(`auth-forgot-${errorMsg.replace(/\./g, '')}${forgotMode === 'id' ? '-id' : ''}`)
      : I18n.get('auth-forgot-error-unknown');
  const isSuccess =
    result &&
    !containsKey(result, 'error') &&
    !containsKey(result, 'structures') &&
    containsKey(result, 'ok') &&
    (result as { ok: boolean }).ok === true;
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

  const toggleDropDown = React.useCallback((open): void => {
    setDropDownOpened(open);
  }, []);

  const setCurrentStructure: typeof setSelectedSructureId = React.useCallback(structureId => {
    setEditing(true);
    setSelectedSructureId(structureId);
  }, []);

  return (
    <KeyboardPageView scrollable scrollViewProps={keyboardPageViewScrollViewProps} safeArea style={styles.page}>
      <View style={styles.infos}>
        <NamedSVG name="user-email" style={styles.img} />
        {!isSuccess ? (
          <SmallText style={styles.infosText}>
            {I18n.get(forgotMode === 'id' ? 'auth-forgot-id-instructions' : 'auth-forgot-password-instructions')}
          </SmallText>
        ) : null}
      </View>
      {!isSuccess ? (
        <InputContainer
          style={styles.inputContainer}
          label={{
            icon: forgotMode === 'id' ? 'ui-mail' : 'ui-user',
            indicator: LabelIndicator.REQUIRED,
            text: forgotMode === 'id' ? I18n.get('auth-forgot-email') : I18n.get('auth-forgot-login'),
          }}
          input={
            <TextInput
              annotation={hasError ? errorText : I18n.get('common-space')}
              onChange={({ nativeEvent: { text } }) => handleInputChange('login', text)}
              placeholder={I18n.get(forgotMode === 'id' ? 'auth-forgot-email' : 'auth-forgot-login')}
              showError={hasError}
              showIconCallback
              value={login}
              keyboardType={forgotMode === 'id' ? 'email-address' : undefined}
              editable={!hasStructures}
              returnKeyLabel={I18n.get('auth-forgot-submit')}
              returnKeyType="done"
              onSubmitEditing={() => doSubmit()}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
            />
          }
        />
      ) : null}
      {(hasStructures && !isSuccess) || (isError && !editing) ? <SmallText style={styles.errorMsg}>{errorText}</SmallText> : null}
      {isSuccess ? (
        <SmallText style={styles.successMsg}>{editing ? '' : isSuccess && I18n.get(`auth-forgot-success-${forgotMode}`)}</SmallText>
      ) : null}
      {forgotMode === 'id' && hasStructures ? (
        <>
          <InputContainer
            style={{
              marginTop: (isError || isSuccess) && !editing ? UI_SIZES.spacing.small : UI_SIZES.spacing.big,
            }}
            label={{
              icon: 'ui-user',
              indicator: LabelIndicator.REQUIRED,
              text: I18n.get('user-profile-firstname'),
            }}
            input={
              <TextInput
                annotation={hasError ? errorText : I18n.get('common-space')}
                onChange={({ nativeEvent: { text } }) => {
                  handleInputChange('firstName', text);
                }}
                placeholder={I18n.get('user-profile-firstname')}
                showError={hasError}
                value={firstName}
                returnKeyLabel={I18n.get('auth-forgot-submit')}
                returnKeyType="done"
                onSubmitEditing={() => doSubmit()}
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
              />
            }
          />
          <InputContainer
            label={{
              icon: 'ui-home',
              indicator: LabelIndicator.REQUIRED,
              text: I18n.get('auth-forgot-school'),
            }}
            input={
              <View style={styles.container}>
                <DropDownPicker
                  items={dropdownItems}
                  open={dropDownOpened}
                  placeholder={selectedStructureName ? selectedStructureName : I18n.get('auth-forgot-structure')}
                  placeholderStyle={styles.selectPlaceholder}
                  setOpen={toggleDropDown}
                  setValue={setCurrentStructure}
                  showTickIcon={false}
                  dropDownContainerStyle={styles.dropdownItems}
                  style={[styles.select, styles.dropdownInput]}
                  textStyle={styles.selectText}
                  value={selectedSructureId}
                />
              </View>
            }
          />
        </>
      ) : null}
      <View
        style={[
          styles.buttonWrapper,
          {
            marginTop: (isError || isSuccess) && !editing ? UI_SIZES.spacing.small : UI_SIZES.spacing.big,
          },
        ]}>
        {(!isSuccess || editing) && (
          <PrimaryButton
            action={() => doSubmit()}
            disabled={canSubmit}
            text={I18n.get('auth-forgot-submit')}
            loading={forgotState === 'RUNNING'}
          />
        )}
        {isSuccess && !editing && <PrimaryButton action={() => navigation.goBack()} text={I18n.get('auth-navigation-goback')} />}

        {hasStructures && errorMsg ? (
          <SmallText style={styles.errorMsg}>{I18n.get('auth-forgot-severalemails-nomatch')}</SmallText>
        ) : null}
      </View>
    </KeyboardPageView>
  );
};

export default connect(undefined, dispatch =>
  bindActionCreators<IForgotPageEventProps>({ trySubmit: tryAction(forgotAction) }, dispatch),
)(ForgotPage);
