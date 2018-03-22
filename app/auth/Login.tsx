import * as React from "react"
import { View, TextInput, ScrollView } from "react-native"
import { IAuthModel } from "../model/Auth";
import { navigate } from "../utils/navHelper"
import { connect } from "react-redux";
import { login } from '../actions/auth';
import { Logo, ValidTextIcon } from "../ui";
import { tr } from "../i18n/t";
import { ErrorMessage } from '../ui/Typography';
import { TextInputLine } from "../ui/forms/TextInputLine";
import styles from "../styles";
import ConnectionTrackingBar from "../ui/ConnectionTrackingBar";

const Form = props => (
	<View style={styles.formGrid}>
		<ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>{props.children}</ScrollView>
	</View>
)

export class Login extends React.Component<{
	auth: IAuthModel;
	login: (email: string, password: string) => Promise<void>;
	navigation?: any;
}, { email: string, password: string, typing: boolean }> {

	state = {
		email: '',
		password: '',
		typing: false
	};

	get isDisabled(){
		return !this.state.email || !this.state.password;
	}

	async login(){
		await this.props.login(this.state.email, this.state.password);
		this.setState({ ...this.state, password: '', typing: false });
	}

	public render() {
		console.log(this.props.auth)
		const { loggedIn, email, password, error } = this.props.auth;

		return (
			<View style={{ flex: 1 }}>
				<ConnectionTrackingBar />
				<Form>
					<Logo />
					<TextInputLine 
						placeholder={tr.Login} 
						onChangeText={(email) => this.setState({ email: email, typing: true })}
						value={ this.state.email || email }
						hasError={ error && !this.state.typing } />
					<TextInputLine 
						placeholder={tr.Password} 
						onChangeText={(password: string) => this.setState({ password: password, typing: true })} 
						secureTextEntry={ true } 
						value={ this.state.password || password }
						hasError={ error && !this.state.typing } />

					<ValidTextIcon 
						onPress={ () => this.login() } 
						disabled={ this.isDisabled } 
						title={tr.Connect} />

					{ (error && !this.state.typing) ? <ErrorMessage>{ error }</ErrorMessage> : <View /> }
				</Form>
				
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
		auth: state.auth
	}),
	dispatch => ({
		login: (email, password) => login(dispatch)(email, password)
	})
)(Login)