import style from "glamorous-native"
import * as React from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { CommonStyles } from '../styles/common/styles';
import I18n from 'react-native-i18n';
import { PageContainer } from './ContainerContent';
import { SingleAvatar } from "./avatars/SingleAvatar";
import { Line } from './Grid';
import { Checkbox } from './forms/Checkbox';
import { User, Group } from "../model/Auth";

const UserLabel = style.text({
    backgroundColor: CommonStyles.primaryLight,
    color: CommonStyles.primary,
    borderRadius: 3,
    padding: 5,
    textAlignVertical: 'center',
    height: 30,
    marginHorizontal: 3,
    marginVertical: 5
});

const ScrollField = style.scrollView({
    maxHeight: 181,
    flexGrow: 0
});

 const FieldContainer = style.view({
     flexDirection: 'row',
     flexWrap: 'wrap',
     backgroundColor: '#FFFFFF',
     alignItems: 'center',
     paddingVertical: 10,
     paddingHorizontal: 17
 })

 const To = style.text({
     textAlignVertical: 'center',
     marginRight: 5,
     marginVertical: 5,
     marginHorizontal: 3
 });

const UserName = style.text({
    fontWeight: 'bold',
    height: 51,
    textAlignVertical: 'center',
    flex: 1,
    paddingLeft: 15,
    paddingRight: 15,
    color: CommonStyles.textColor,
});

const UserLine = ({ id, displayName, name, checked, onPick, onUnpick }) => (
    <TouchableOpacity onPress={ () => !checked ? onPick() : onUnpick() }>
        <Line style={{ padding: 20, paddingBottom: 0, alignItems: 'center' }}>
            <SingleAvatar size={ 51 } userId={ id } />
            <UserName numberOfLines={ 2 }>{ name || displayName }</UserName>
            <Checkbox checked={ checked } onCheck={ () => onPick() } onUncheck={ () => onUnpick() } />
        </Line>
    </TouchableOpacity>
)

export default class SearchUser extends React.Component<{ remaining, picked, onPickUser, onUnpickUser }, { searchText: string, max: number }>{
    state = { searchText: '', max: 20 };
    input: any;

    isMatch = visible => (
        visible.name && visible.name.toLowerCase().indexOf(this.state.searchText.toLowerCase()) !== -1
    ) ||  (
        visible.displayName && visible.displayName.toLowerCase().indexOf(this.state.searchText.toLowerCase()) !== -1
    );

    expend(){
        console.log(this.state.max)
        this.setState({ ...this.state, max: this.state.max + 20 })
    }

    get usersArray(){
        return [
            ...this.props.picked.filter(v => this.isMatch(v)),
            ...this.props.remaining.filter(v => this.state.searchText && this.isMatch(v)).slice(0, this.state.max)
        ];
    }

    pickUser(user){
        this.props.onPickUser(user);
        this.setState({...this.state, searchText: '' });
        this.input.clear();
    }

    render (){
        console.log(this.state)
        return (
            <PageContainer>
                <ScrollField>
                    <FieldContainer>
                        <To>{ I18n.t('to') }</To>
                        { this.props.picked.map(p => <TouchableOpacity onPress={ () => this.props.onUnpickUser(p) }>
                            <UserLabel>{ p.name || p.displayName }</UserLabel>
                        </TouchableOpacity>) }
                        <TextInput 
                            ref={ r => this.input = r }
                            style={{ flex : 1, minWidth: 100, height: 40 }} 
                            underlineColorAndroid={ "transparent" } 
                            value={ this.state.searchText }
                            onChangeText={ text => this.setState({ ...this.state, searchText: text }) } />
                    </FieldContainer>
                </ScrollField>
                <FlatList 
                    keyboardShouldPersistTaps={ 'always' }
                    style={{ flex: 1, borderTopColor: '#EEEEEE', borderTopWidth: 1 }} 
                    data={ this.usersArray } 
                    keyExtractor={ u => u.id }
                    renderItem={ (el) => <UserLine
                        key={ el.item.id }
                        onPick={ () => this.pickUser(el.item) } 
                        onUnpick={ () => this.props.onUnpickUser(el.item) } { ...el.item } /> }
                    onEndReached={ () => this.expend() }
                    refreshing={ true }
                />
            </PageContainer>
        );
    }
}