import * as React from "react"
import { View, TextInput, ScrollView, KeyboardAvoidingView, Image } from "react-native"
import { IAuthModel } from "../model/Auth";
import { navigate } from "../utils/navHelper"
import { connect } from "react-redux";
import { login } from '../actions/auth';
import { FlatButton } from "../ui";
import { tr } from "../i18n/t";
import { ErrorMessage } from '../ui/Typography';
import { TextInputLine } from "../ui/forms/TextInputLine";
import styles from "../styles";
import ConnectionTrackingBar from "../ui/ConnectionTrackingBar";
import style from 'glamorous-native';

const Form = props => (
	<View style={styles.formGrid}>
		<ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>{props.children}</ScrollView>
	</View>
)

const Logo = () => <View style={{ flexGrow: 2, alignItems: 'center', justifyContent: 'center' }}>
	<Image resizeMode="contain" style={{ height: 50, width: 50 }} source={require("../../assets/icons/icon.png")} />
</View>;

export class Login extends React.Component<{
	auth: IAuthModel;
	login: (email: string, password: string) => Promise<void>;
	navigation?: any;
}, { email: string, password: string, typing: boolean, loading: boolean }> {

	state = {
		email: undefined,
		password: '',
		typing: false,
		loading: false
	};

	get isDisabled(){
		return !(this.state.email || this.props.auth.email) || !this.state.password;
	}

	async login(){
		this.setState({ ...this.state, loading: true });
		await this.props.login(this.state.email, this.state.password);
		this.setState({ ...this.state, password: '', typing: false, loading: false });
	}

	public render() {
		console.log(this.props.auth)
		const { loggedIn, email, password, error } = this.props.auth;

		return (
			<KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#ffffff', paddingTop: 30 }}>
				<ConnectionTrackingBar />
				<View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-start', flexDirection: 'column', padding: 40 }}>
					<Logo />
					<TextInputLine 
						placeholder={tr.Login} 
						onChangeText={(email) => this.setState({ email: email, typing: true })}
						value={ this.state.email !== undefined ? this.state.email : email }
						hasError={ error && !this.state.typing } />
					<TextInputLine 
						placeholder={tr.Password} 
						onChangeText={(password: string) => this.setState({ password: password, typing: true })} 
						secureTextEntry={ true } 
						value={ this.state.password || password }
						hasError={ error && !this.state.typing } />

					<ErrorMessage>{ error }</ErrorMessage>

					<View style={{ flexGrow: 2, alignItems: 'center', justifyContent: 'flex-start', marginTop: '5%' }}>
						<FlatButton 
							onPress={ () => this.login() } 
							disabled={ this.isDisabled } 
							title={tr.Connect} loading={ this.state.loading } />
					</View>
					
				</View>
				
			</KeyboardAvoidingView>
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
		auth: state.auth
	}),
	dispatch => ({
		login: (email, password) => login(dispatch)(email, password)
	})
)(Login)