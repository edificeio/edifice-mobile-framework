import style from "glamorous-native"
import * as React from "react";
import { TextInput } from 'react-native';
import { CommonStyles } from '../styles/common/styles';
import I18n from "i18n-js";
import { PageContainer } from './ContainerContent';
import UserList, { IUser } from "./UserList";
import TouchableOpacity from "../ui/CustomTouchableOpacity";

export const UserLabel = style.text({
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

export default class SearchUser extends React.Component<{ remaining, picked, onPickUser, onUnpickUser }, { searchText: string, max: number }>{
    state = { searchText: '', max: 20 };
    input: any;

    isMatch = visible => (
        visible.name && visible.name.toLowerCase().indexOf(this.state.searchText.toLowerCase()) !== -1
    ) || (
            visible.displayName && visible.displayName.toLowerCase().indexOf(this.state.searchText.toLowerCase()) !== -1
        );

    expend() {
        // console.log(this.state.max)
        this.setState({ ...this.state, max: this.state.max + 20 })
    }

    get usersArray(): IUser[] {
        return [
            ...this.props.picked.filter(v => this.isMatch(v)),
            ...this.props.remaining.filter(v => this.state.searchText && this.isMatch(v)).slice(0, this.state.max)
        ];
    }

    pickUser = (user: IUser) => {
        this.props.onPickUser(user);
        this.setState({ ...this.state, searchText: '' });
        this.input.clear();
    }

    render() {
        // console.log(this.state)
        let index = 0;
        return (
            <PageContainer>
                <ScrollField>
                    <FieldContainer>
                        <To>{I18n.t('to')}</To>
                        {this.props.picked.map(p => <TouchableOpacity key={"Touchable_" + (index++)} onPress={() => this.props.onUnpickUser(p)}>
                            <UserLabel>{p.name || p.displayName}</UserLabel>
                        </TouchableOpacity>)}
                        <TextInput
                            ref={r => this.input = r}
                            style={{ flex: 1, minWidth: 100, height: 40 }}
                            underlineColorAndroid={"transparent"}
                            value={this.state.searchText}
                            onChangeText={text => this.setState({ ...this.state, searchText: text })} />
                    </FieldContainer>
                </ScrollField>
                <UserList
                    selectable={true}
                    users={this.usersArray}
                    onPickUser={(user) => this.pickUser(user)}
                    onUnpickUser={(user) => this.props.onUnpickUser(user)}
                    onEndReached={() => this.expend()}
                />
            </PageContainer>
        );
    }
}
