import style from "glamorous-native"
import * as React from "react";
import { View, Text, TextInput, FlatList } from "react-native";
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
    height: 30
});

 const Container = style.view({
     flexDirection: 'row',
     flexWrap: 'wrap',
     backgroundColor: '#FFFFFF',
     borderBottomColor: '#EEEEEE',
     borderBottomWidth: 1
 })

 const To = style.text({
     textAlignVertical: 'center',
     paddingLeft: 20
 });

const UserName = style.text({
    fontWeight: 'bold',
    height: 51,
    textAlignVertical: 'center',
    flex: 1,
    paddingLeft: 15,
    paddingRight: 15,
    color: CommonStyles.textColor,
})

const UserLine = ({ id, displayName, name, checked }) => (
    <Line style={{ padding: 20, paddingBottom: 0, alignItems: 'center' }}>
        <SingleAvatar size={ 51 } userId={ id } />
        <UserName numberOfLines={ 1 }>{ name || displayName }</UserName>
        <Checkbox checked={ checked } />
    </Line>
)

export default class SearchUser extends React.Component<{ visibles, picked, onPickUser }, { searchText: string, max: number }>{
    state = { searchText: '', max: 20 };

    isMatch = visible => (
        visible.name && visible.name.toLowerCase().indexOf(this.state.searchText.toLowerCase()) !== -1
    ) ||  (
        visible.displayName && visible.displayName.toLowerCase().indexOf(this.state.searchText.toLowerCase()) !== -1
    );

    expend(){
        console.log(this.state.max)
        this.setState({ ...this.state, max: this.state.max + 20 })
    }

    render (){
        console.log(this.state)
        return (
            <PageContainer>
                <Container>
                    <To>{ I18n.t('to') }</To>
                    { this.props.picked.map(p => <UserLabel>{ p.name || p.displayName }</UserLabel>) }
                    <TextInput 
                        style={{ flex : 1 }} 
                        underlineColorAndroid={ "transparent" } 
                        onChangeText={ text => this.setState({ ...this.state, searchText: text }) } />
                </Container>
                { 
                    this.state.searchText ? 
                    <FlatList 
                        style={{ flex: 1 }} 
                        data={ this.props.visibles.filter(v => this.isMatch(v)).slice(0, this.state.max) } 
                        renderItem={ (el) => <UserLine { ...el.item } /> }
                        onEndReached={ () => this.expend() }
                        refreshing={ true }
                    /> :
                    <View />
                }
            </PageContainer>
        );
    }
}