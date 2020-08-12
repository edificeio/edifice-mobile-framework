import style from "glamorous-native"
import * as React from "react";
import { FlatList, TouchableOpacity } from 'react-native';
import { CommonStyles } from '../styles/common/styles';
import { SingleAvatar } from "./avatars/SingleAvatar";
import { Line } from './Grid';
import { Checkbox } from './forms/Checkbox';
import I18n from "i18n-js";

export type IUser = { id: string, name: string, displayName: string, isGroup: boolean, checked: boolean };
const UserName = style.text({
    fontWeight: 'bold',
    textAlignVertical: 'center',
    flex: 1,
    paddingLeft: 15,
    paddingRight: 15,
    color: CommonStyles.textColor,
});

const UserLine = ({ id, displayName, name, checked, onPick, onUnpick, selectable, isGroup }) => (
    <TouchableOpacity onPress={() => !checked ? onPick() : onUnpick()}>
        <Line style={{ padding: 10, alignItems: 'center' }}>
            <SingleAvatar size={51} userId={{ id, isGroup }} />
            <UserName numberOfLines={2}>{name || displayName}</UserName>
            {selectable && <Checkbox checked={checked} onCheck={() => onPick()} onUncheck={() => onUnpick()} />}
        </Line>
    </TouchableOpacity>
)

export default function UserList(props: {
    users: IUser[],
    selectable: boolean,
    onPickUser?: (user: IUser) => void,
    onUnpickUser?: (user: IUser) => void,
    onEndReached?: () => void
}) {
    return (
        <FlatList
            keyboardShouldPersistTaps={'always'}
            alwaysBounceVertical={false}
            style={{
                width: "100%",
                position: "absolute",
                top: 0, bottom: 0,
                zIndex: 2,
                elevation: 1,
                backgroundColor: CommonStyles.tabBottomColor,
                flex: 1, borderTopColor: '#EEEEEE', borderTopWidth: 1
            }}
            data={props.users}
            keyExtractor={u => u.id}//increment in next line
            renderItem={(el) => <UserLine
                selectable={false}
                onPick={() => props.onPickUser && props.onPickUser(el.item)}
                onUnpick={() => props.onUnpickUser && props.onUnpickUser(el.item)} {...el.item} />}
            onEndReached={() => props.onEndReached && props.onEndReached()}
            refreshing={true}
        />
    );
}

type IUserListRow = { user?: IUser, group?: string };
export function UserListGroupped(props: {
    users: { [id: string]: IUser[] },
    selectable: boolean,
    onPickUser?: (user: IUser) => void,
    onUnpickUser?: (user: IUser) => void,
    onEndReached?: () => void
}) {
    let childIndex = 0;
    const rows: Array<IUserListRow> = [];
    for (let group in props.users) {
        rows.push({ group })
        for (let user of props.users[group]) {
            rows.push({ user });
        }
    }
    return (
        <FlatList
            keyboardShouldPersistTaps={'always'}
            style={{ flex: 1, borderTopColor: '#EEEEEE', borderTopWidth: 1 }}
            data={rows}
            keyExtractor={u => "UserListGroupped_" + (childIndex++)}//increment in next line
            renderItem={(el) => {
                if (el.item.group) {
                    return <GroupText>{I18n.t(el.item.group)}</GroupText>
                } else {
                    return <UserLine
                        selectable={props.selectable}
                        onPick={() => props.onPickUser && props.onPickUser(el.item.user)}
                        onUnpick={() => props.onUnpickUser && props.onUnpickUser(el.item.user)} {...el.item.user} />
                }
            }
            } onEndReached={() => props.onEndReached && props.onEndReached()}
            refreshing={true}
        />
    );
}


const GroupText = style.text({
    paddingHorizontal: 24,
    fontFamily: CommonStyles.primaryFontFamily,
    fontSize: 14,
    paddingTop: 18
});