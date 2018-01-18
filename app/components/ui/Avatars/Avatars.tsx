import * as React from "react"
import Avatar from "../../../connectors/ui/Avatar";
import {Col} from "../Col";
import {Row} from "../Row";


export interface AvatarsProps {
    displayNames: string[][],
}

const DEFAULT_AVATAR = "46c7bc61-b9dd-4c25-b164-fd6252236603"

export class Avatars extends React.Component<AvatarsProps> {

    render2Avatar(uri) {
        return (
            <Col size={1}>
                <Row justifyContent={'flex-start'} alignItems={'flex-start'}>
                    <Avatar id={uri[0]}/>
                </Row>
                <Row justifyContent={'flex-end'} alignItems={'flex-end'}>
                    <Avatar id={uri[1]}/>
                </Row>
            </Col>
        )
    }


    render3Avatar(uri) {
        return (
            <Col size={1}>
                <Row justifyContent={'flex-start'} alignItems={'flex-start'}>
                    <Avatar id={uri[0]}/>
                    <Avatar id={uri[1]}/>
                </Row>
                <Row justifyContent={'center'} alignItems={'center'}>
                    <Avatar id={uri[2]}/>
                </Row>
            </Col>
        )
    }

    render4Avatar(uri) {
        return (
            <Col>
                <Row justifyContent={'flex-start'} alignItems={'flex-start'}>
                    <Avatar id={uri[0]}/>
                    <Avatar id={uri[1]}/>
                </Row>
                <Row justifyContent={'flex-start'} alignItems={'flex-start'}>
                    <Avatar id={uri[2]}/>
                    <Avatar id={uri[3]}/>
                </Row>
            </Col>
        )
    }



    render() {

        const uri = this.props.displayNames.reduce((acc, elem) => [...acc, elem[0]], [])
        let idx = 0

        if (uri.length > 4) {
            uri[3] = DEFAULT_AVATAR
            uri.length = 4
        }

        if (uri.length === 1)
            return <Avatar large id={uri[0]}/>
        else if (uri.length === 2)
            return this.render2Avatar(uri)
        else if (uri.length === 3)
            return this.render3Avatar(uri)
        else if (uri.length === 4)
            return this.render4Avatar(uri)
    }
}
