import * as React from 'react';
import {addNavigationHelpers, NavigationDispatch, NavigationStackAction, StackNavigator} from 'react-navigation';
import { StatusBar } from 'react-native';
import SplashScreen from 'react-native-smart-splash-screen'
import Conversation from '../connectors/Conversation';
import ReadMail from '../connectors/ReadMail';
import Timeline from '../connectors/Timeline';
import SignupLoginRecover from '../connectors/components/auth/SignupLoginRecover'
import {Row, StatusAlert} from '.'
import ProgressBar from '../connectors/components/ui/ProgressBar'
import {CommonStyles} from "./styles/common/styles";
import {AuthProps} from '../model/Auth'

const AppNavigator = StackNavigator({
        Conversation: { screen: Conversation },
        ReadMail: { screen: ReadMail },
        Timeline: { screen: Timeline }
    },
    {
        headerMode: 'screen'
    } as any);


export interface AppProps {
    auth?: AuthProps
    dispatch?: (any) => any
    navigation?: NavigationDispatch<NavigationStackAction>
}

export class App extends React.Component< AppProps, any> {

    componentDidMount () {
        //SplashScreen.close(SplashScreen.animationType.scale, 850, 500)
        SplashScreen.close({
            animationType: SplashScreen.animationType.scale,
            duration: 850,
            delay: 500,
        })
    }

    renderBody() {
        const {auth} = this.props
        const {loggedIn} = auth


        if(!loggedIn){
            return <SignupLoginRecover />
        }
        return (
            <AppNavigator
                navigation={addNavigationHelpers({
                    dispatch: this.props.dispatch,
                    state: this.props.navigation,
                })}
            />
        )
    }

    render() {
        return (
            <Row>
                <StatusBar backgroundColor={CommonStyles.mainColorTheme} barStyle="light-content" />
                <ProgressBar />
                <StatusAlert />
                {this.renderBody()}
            </Row>
        )
    }
}
