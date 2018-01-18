import * as React from "react"
import style from "glamorous-native"
import {layoutSize} from "../../../constants/layoutSize";
import {Conf} from "../../../Conf";


const LargeImage = style.image( {
    borderRadius: layoutSize.LAYOUT_24,
	width: layoutSize.LAYOUT_45,
	height: layoutSize.LAYOUT_45,
})

const SmallImage = style.image( {
        borderRadius: layoutSize.LAYOUT_8,
        width: layoutSize.LAYOUT_16,
        height: layoutSize.LAYOUT_16,
        margin: layoutSize.LAYOUT_1
    }
)

export interface AvatarProps {
    avatar?: string,
    id: string,
    index?:number
    large?: boolean,
    readAvatar?: (string) => void
}


export class Avatar extends React.Component<AvatarProps, {}> {
    componentDidMount() {
        const {avatar, id, readAvatar} = this.props

        if (avatar === undefined) {
            readAvatar(id)
        }
    }

    shouldComponentUpdate(nextProps) {
        return this.props.avatar !== nextProps.avatar
    }

    render() {
        const {avatar, index, large} = this.props

        if (avatar === undefined) {
            return <style.View/>
        }

        if (large)
            return (
                <LargeImage source={{uri: "data:image/jpeg;base64," + avatar}}/>

            )
        else
            return (
                <SmallImage source={{uri: "data:image/jpeg;base64," + avatar}}/>
            )
    }
}
/*
    render() {
        const {id, large} = this.props
        const pathSmall = `${Conf.platform}/workspace/document/${id}?thumbnail=20*20`
        const pathLarge = `${Conf.platform}/workspace/document/${id}?thumbnail=48*48`

        if (large)
            return (
                <LargeImage source={{uri: pathLarge}}/>
            )
        else
            return (
                <SmallImage source={{uri: pathSmall}}/>
            )
    }
}
*/
