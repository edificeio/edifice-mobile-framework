import * as React from "react"
import { View, TextInput, ScrollView, KeyboardAvoidingView, Image, TouchableWithoutFeedback, Platform } from "react-native"
import { navigate } from "../utils/navHelper"
import { connect } from "react-redux";
import { FlatButton } from "../ui";
import { ErrorMessage } from '../ui/Typography';
import { TextInputLine } from "../ui/forms/TextInputLine";
import styles from "../styles";
import ConnectionTrackingBar from "../ui/ConnectionTrackingBar";
import style from 'glamorous-native';
import { LoginResult, login } from "./actions/login";
import { IAuthState } from './reducer';
import I18n from 'react-native-i18n';

const Logo = () => <View style={{ flexGrow: 2, alignItems: 'center', justifyContent: 'center' }}>
	<Image resizeMode="contain" style={{ height: 50, width: 50 }} source={require("../../assets/icons/icon.png")} />
</View>;

const FormContainer = style.view({
	flex: 1,
	alignItems: 'center',
	justifyContent: 'center',
	flexDirection: 'column',
	padding: 40,
	paddingTop: 80
})

export class Login extends React.Component<{
	auth: IAuthState;
	login: (email: string, password: string) => Promise<LoginResult>;
	navigation?: any;
	headerHeight: number;
}, { email: string, password: string, typing: boolean, loading: boolean }> {

	loginRef: TextInput;
	passwordRef: TextInput;

	state = {
		email: undefined,
		password: '',
		typing: false,
		loading: false
	};

	get isDisabled(){
		return !(this.state.email || this.props.auth.email || this.props.navigation.state.params.email) || !this.state.password;
	}

	async login(){
		this.setState({ ...this.state, loading: true });
		const result = await this.props.login(this.state.email || this.props.auth.email || this.props.navigation.state.params.email, this.state.password);
		if(result !== LoginResult.success){
			this.setState({ ...this.state, password: '', typing: false, loading: false });
		}
	}

	unfocus(){
		this.loginRef.blur();
		this.passwordRef.blur();
	}

	public render() {
		console.log(this.props.auth)
		let { loggedIn, email, password, error } = this.props.auth;
		if(!email){
			email = this.props.navigation.state.params.email;
		}

		return (
			<View style={{ flex: 1, backgroundColor: '#ffffff' }}>
				<KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#ffffff' }} behavior={ Platform.OS === "ios" ? 'padding' : undefined }>
				<ConnectionTrackingBar style={{ position: 'absolute' }} />
					<TouchableWithoutFeedback style={{ flex: 1 }} onPress={ () => this.unfocus() }>
						<FormContainer>
							<Logo />
							<TextInputLine 
								inputRef={ (ref) => this.loginRef = ref }
								placeholder={ I18n.t('Login') } 
								onChangeText={(email) => this.setState({ email: email.trim(), typing: true })}
								value={ this.state.email !== undefined ? this.state.email : email }
								hasError={ error && !this.state.typing } />
							<TextInputLine 
								inputRef={ (ref) => this.passwordRef = ref }
								placeholder={ I18n.t('Password') } 
								onChangeText={(password: string) => this.setState({ password: password, typing: true })} 
								secureTextEntry={ true } 
								value={ this.state.password || password }
								hasError={ error && !this.state.typing } />
							<ErrorMessage>{ this.state.typing ? '' : error }</ErrorMessage>


							<View style={{ flexGrow: 2, alignItems: 'center', justifyContent: 'flex-start', marginTop: error && !this.state.typing ? 10 : 30 }}>
								<FlatButton 
									onPress={ () => this.login() } 
									disabled={ this.isDisabled } 
									title={ I18n.t("Connect") } loading={ this.state.loading } />
							</View>
						</FormContainer>
					</TouchableWithoutFeedback>
				</KeyboardAvoidingView>
			</View>
		)
	}
}

export const initialStateWithEmail = email => ({
	email,
	password: "",
	loggedIn: false,
	synced: true,
	error: ''
})

export default connect(
	(state: any, props: any) => ({
		auth: state.auth,
		headerHeight: state.ui.headerHeight
	}),
	dispatch => ({
		login: (email, password) => login(dispatch)(email, password)
	})
)(Login)