import style from "glamorous-native"
import * as React from "react";
import { FlatList, TouchableOpacity } from 'react-native';
import { CommonStyles } from '../styles/common/styles';
import { SingleAvatar } from "./avatars/SingleAvatar";
import { Line } from './Grid';
import { Checkbox } from './forms/Checkbox';

export type IUser = { id: string, name: string, displayName: string, checked: boolean };
const UserName = style.text({
    fontWeight: 'bold',
    height: 51,
    textAlignVertical: 'center',
    flex: 1,
    paddingLeft: 15,
    paddingRight: 15,
    color: CommonStyles.textColor,
});

const UserLine = ({ id, displayName, name, checked, onPick, onUnpick, selectable }) => (
    <TouchableOpacity onPress={() => !checked ? onPick() : onUnpick()}>
        <Line style={{ padding: 20, paddingBottom: 0, alignItems: 'center' }}>
            <SingleAvatar size={51} userId={id} />
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
            style={{ flex: 1, borderTopColor: '#EEEEEE', borderTopWidth: 1 }}
            data={props.users}
            keyExtractor={u => u.id}
            renderItem={(el) => <UserLine
                key={el.item.id}
                selectable={props.selectable}
                onPick={() => props.onPickUser && props.onPickUser(el.item)}
                onUnpick={() => props.onUnpickUser && props.onUnpickUser(el.item)} {...el.item} />}
            onEndReached={() => props.onEndReached && props.onEndReached()}
            refreshing={true}
        />
    );
}
