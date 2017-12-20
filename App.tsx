import * as React from 'react';
import { StackNavigator, NavigationActions } from 'react-navigation';
import { View } from 'react-native';
import { StyleSheet, ActivityIndicator, Platform, StatusBar } from 'react-native';
import { Inbox } from './components/Inbox';
import { ReadMail } from './components/ReadMail';
import { Timeline } from './components/Timeline';
import { me } from './model/User';
import { StyleConf } from './styles/StyleConf';
import { Login } from './components/Login';


const mainStyle = StyleSheet.create({
    spinner: {
      flex: 1,
      height: '100%',
      width: '100%'
    }
})

const AppNavigator = StackNavigator({
  Inbox: { screen: Inbox },
  ReadMail: { screen: ReadMail },
  Timeline: { screen: Timeline }
},
{
  headerMode: 'screen'
} as any);

export default class App extends React.Component<undefined, { ready: boolean, loggedIn: boolean }> {
  constructor(props){
    super(props);
    this.state = { 
      ready: false,
      loggedIn: me.loggedIn
    };
    me.sync().then(() => this.setState({ 
      ready: true,
      loggedIn: me.loggedIn
     })
    );
  }

  render() {
    if(!this.state.ready){
      console.log('spinner')
      return <ActivityIndicator size={ 250 } color={ StyleConf.primary } style={ mainStyle.spinner } />
    }
    if(!this.state.loggedIn){
      return <Login onLogin={ () => this.setState({ ready: true, loggedIn: true}) } />
    }
    return (
      <AppNavigator style={ { backgroundColor: StyleConf.primary} } />
    );
  }
}