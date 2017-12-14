import RNFetchBlob from 'react-native-fetch-blob'
import * as React from 'react';
import { Conf } from '../Conf';
import { StyleSheet, Image, View, TouchableHighlight, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const portal = StyleSheet.create({
    main: {
        height: '100%'
    },
    menu: {
        height: 56,
        flexDirection: 'row'
    },
    menuItem: {
        width: '33%',
        alignItems: 'center'
    },
    menuIcon: {
        width: 30
    },
    view: {
        flex: 1
    }
})

export class Portal extends React.Component<{ children: any, navigation: any }, {}> {
    base64Str: string;

    constructor(props){
        super(props);
        this.state = {  };
    }

    redirectTo(component: string){
        this.props.navigation.navigate(component);
    }
    
    render(){
        return (
            <View style={ portal.main }>
                <View style={ portal.view }>
                    { this.props.children }
                </View>
                <View style={ portal.menu }>
                    <TouchableHighlight style={ portal.menuItem } onPress={ () => this.redirectTo('Timeline') }>
                        <View>
                            <Icon name="mail-outline" size={ 30 } style={ portal.menuIcon } />
                            <Text>Nouveautés</Text>
                        </View>
                    </TouchableHighlight>
                    <TouchableHighlight style={ portal.menuItem }  onPress={ () => this.redirectTo('Inbox') }>
                        <View>
                            <Icon name="mail-outline" size={ 30 } style={ portal.menuIcon } />
                            <Text>Conversation</Text>
                        </View>
                    </TouchableHighlight>
                    <TouchableHighlight style={ portal.menuItem }>
                        <View>
                            <Icon name="mail-outline" size={ 30 } style={ portal.menuIcon } />
                            <Text>Profil</Text>
                        </View>
                    </TouchableHighlight>
                </View>
            </View>
        );
    }
}