import * as React from "react"
import {layoutSize} from "../../constants/layoutSize";
import {CloseIcon, SearchIcon} from "./icons/SearchIcon";
import style from "glamorous-native";
import {CommonStyles} from "../styles/common/styles";



export interface SearchBarProps {
    filter?: (store: string, value: string) => object
    navigation?: any,
    storeName?: string
}

const Container = style.view(
    {
        alignItems: 'center',
        backgroundColor: CommonStyles.mainColorTheme,
        elevation: 5,
        flexDirection: 'row',
        height: layoutSize.LAYOUT_58,
        justifyContent: 'space-around',
        paddingHorizontal: layoutSize.LAYOUT_20,
        shadowColor: CommonStyles.shadowColor,
        shadowOffset: CommonStyles.shadowOffset,
        shadowOpacity: CommonStyles.shadowOpacity,
        shadowRadius: CommonStyles.shadowRadius,
    }
)

const TextInput = style.textInput({
        color: 'white',
        fontSize: layoutSize.LAYOUT_14,
        flex: 1,
        marginLeft: layoutSize.LAYOUT_8,
    },
    ({ value }) => ({
        fontFamily: value.length === 0 ? CommonStyles.primaryFontFamilyLight : CommonStyles.primaryFontFamily,
        height: layoutSize.LAYOUT_40
    })
)

export class SearchBar extends React.PureComponent<SearchBarProps, {}> {
    state = {
        value: ''
    }

    public onChangeText(value) {
        const {filter, storeName} = this.props

        if (value === undefined) return

        filter(storeName, value)

        this.setState({ value })

    }

    onClose() {
        const {filter, navigation} = this.props

        filter( "conversations", null)

        navigation.goBack()

    }


    render() {
        return (
            <Container>
                <SearchIcon onPress={() => {}} screen={"ConversationSearch"}/>
                <TextInput
                    autoFocus={true}
                    enablesReturnKeyAutomatically={true}
                    onChangeText={value=> this.onChangeText(value)}
                    placeholder={'Rechercher...'}
                    placeholderTextColor={'white'}
                    returnKeyType={'search'}
                    underlineColorAndroid={'transparent'}
                    value={this.state.value}
                />
                <CloseIcon onPress={() => this.onClose()}/>
            </Container>
        );
    }
}

