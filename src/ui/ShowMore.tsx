import * as React from "react";
import { View, LayoutChangeEvent, LayoutRectangle, Dimensions } from "react-native";


export interface IShowMoreProps<T> {
    data: T[],
    renderLeft?: () => JSX.Element
    renderItem: (index: number, value: string, props: { maxWidth: number }) => JSX.Element
    renderEllipsis: (nbHidden: number) => JSX.Element
}

interface IShowMoreState {
    measured: boolean
    nbVisible: number
    maxWidth: number
    maxHeight: number
    lastMaxWidth: number
}

/**
 * That component hide overflow and display ellipsis if needed.
 * At first it measure the layout, then it display only visible children
 */
export class ShowMore<T> extends React.Component<IShowMoreProps<T>, IShowMoreState> {
    public state = {
        measured: false,
        nbVisible: 0,
        maxHeight: 1000000,
        maxWidth: 10000000,
        lastMaxWidth: null
    }
    private parentLayout: LayoutRectangle = null;
    private ellipsisLayout: LayoutRectangle = null;
    private childrenLayouts: LayoutRectangle[] = [];
    private onLayoutParent = (event: LayoutChangeEvent) => {
        if (this.state.measured) {
            console.warn("[ShowMore] should not receive layout parent event after measure...")
            return;
        }
        this.parentLayout = event.nativeEvent.layout;
        this.checkIfMeasureFinished();
    }
    private onLayoutEllipsis = (event: LayoutChangeEvent) => {
        if (this.state.measured) {
            console.warn("[ShowMore] should not receive layout ellipsis event after measure...")
            return;
        }
        this.ellipsisLayout = event.nativeEvent.layout;
        this.checkIfMeasureFinished();
    }
    private onLayoutChild = (event: LayoutChangeEvent, index: number) => {
        if (this.state.measured) {
            console.warn("[ShowMore] should not receive layout child event after measure...")
            return;
        }
        this.childrenLayouts[index] = event.nativeEvent.layout;
        this.checkIfMeasureFinished();
    }
    private checkIfMeasureFinished = () => {
        if (this.state.measured) {
            //console.log("[ShowMore] already measured...")
            return;
        }
        if (!this.parentLayout) {
            //console.log("[ShowMore] layout not finished (parent)...")
            return;
        }
        if (this.childrenLayouts.length != this.props.data.length) {
            //console.log("[ShowMore] layout not finished (children length)...")
            return;
        }
        if (!this.ellipsisLayout) {
            //console.log("[ShowMore] layout not finished (ellipsis)...")
            return;
        }
        const falsyValues = this.childrenLayouts.filter(layout => !layout);
        if (falsyValues.length > 0) {
            //console.log("[ShowMore] layout not finished (falsy)...")
            return;
        }
        const screenWidth = Dimensions.get("screen").width;
        //console.log("[ShowMore] layout finished...", "Parent width :", this.parentLayout.width, "Screen Width:", screenWidth,"Children Layout",this.childrenLayouts)
        const maxRight = Math.min(this.parentLayout.width, screenWidth);
        let visibleItems = 0;
        let maxHeight = 0;
        for (let childLayout of this.childrenLayouts) {
            if(!childLayout){
                console.warn("[ShowMore] Child layout is null:",this.childrenLayouts)
                return;
            }
            let currentRight = childLayout.x + childLayout.width;
            maxHeight = Math.max(maxHeight, childLayout.height);
            if (currentRight < maxRight) {
                visibleItems++;
            } else {
                break;
            }
        }
        //console.log("[ShowMore] Visible items: ", visibleItems, "Max right: ", maxRight)
        //display at least 1 (must be after removing child)
        if (visibleItems <= 0) {
            visibleItems = 1;
        }
        //if some elements are hidden => ellipsis is visible
        let realMaxRight = maxRight;
        let lastMaxWidth = null;
        if (visibleItems < this.props.data.length) {
            //compute real max right (including ellipsis)
            realMaxRight = maxRight - this.ellipsisLayout.width;
            maxHeight = Math.max(maxHeight, this.ellipsisLayout.height);
            const lastLayout = this.childrenLayouts[visibleItems - 1];
            //if ellipsis hide the last element => set max width for last element
            if (lastLayout) {
                let lastRight = lastLayout.x + lastLayout.width;
                if (realMaxRight < lastRight) {
                    //max width of latest element is equal to current width minus overflow
                    let overflow = lastRight - realMaxRight;
                    //console.log("[ShowMore] Last Maw width computing. Overflow: ", overflow, "Real Max right: ", realMaxRight, "Last Right:", lastRight, "Last layout: ", lastLayout)
                    lastMaxWidth = lastLayout.width - overflow - 10;
                }
            }
        }
        //console.log("[ShowMore] After ellipsis,Visible items: ", visibleItems, "Real Max right: ", realMaxRight, "Last Max Width:", lastMaxWidth, "Max Height: ", maxHeight)

        //
        this.setState({ measured: true, maxWidth: maxRight, nbVisible: visibleItems, maxHeight, lastMaxWidth })
    }
    private renderChildren = () => {
        const { data, renderItem } = this.props;
        const { measured, nbVisible, lastMaxWidth } = this.state;
        const max = measured ? nbVisible : data.length;
        const children: JSX.Element[] = [];
        for (let i = 0; i < max; i++) {
            const isLatest = i == (max - 1);
            const value = `${data[i]}`;
            const child = renderItem(i, value, { maxWidth: isLatest ? lastMaxWidth : undefined });
            if (measured) {
                children.push(child);
            } else {
                children.push((<View key={"ShowMoreChild_" + i} onLayout={(ev) => this.onLayoutChild(ev, i)}>{child}</View>));
            }
        }
        return children;
    }
    private renderEllipsis = () => {
        const { data, renderEllipsis } = this.props;
        const { measured, nbVisible } = this.state;
        const total = data.length;
        if (measured) {
            const nbHidden = total - nbVisible;
            return nbHidden > 0 ? renderEllipsis(nbHidden) : null;
        } else {
            return <View onLayout={this.onLayoutEllipsis}>{renderEllipsis(total)}</View>
        }
    }
    public render() {
        const { renderLeft } = this.props;
        const { measured, maxHeight, maxWidth } = this.state;
        const screenWidth = Dimensions.get("screen").width;
        return <View
                    style={{
                        //hide component during layout
                        // transform: measured ? [] : [{
                        //     translateX: screenWidth * 10
                        // }],
                        opacity: measured ? 1 : 0,
                        flex: measured ? undefined : 1,
                        maxHeight: measured ? maxHeight : undefined,
                        maxWidth: measured ? maxWidth : undefined,
                        flexDirection: "row",
                        flexWrap: "nowrap",
                        overflow: "hidden",
                        alignItems: "center"
                    }} 
                    onLayout={!measured && this.onLayoutParent}
                >
                    {renderLeft && renderLeft()}
                    {this.renderChildren()}
                    {this.renderEllipsis()}
                </View>
    }
}