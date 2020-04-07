import * as React from "react";
import { UserLabel } from "../../ui/SelectThreadInfos";
import { CommonStyles } from "../../styles/common/styles";
import style from "glamorous-native";
import { TouchableOpacity, View } from "react-native";
import { ShowMore } from "../../ui/ShowMore";
import I18n from "i18n-js";

export default function ThreadInputReceivers(props: { show: boolean, names: string[], onPress: () => void }) {
    const { names, onPress, show } = props;
    if (!show) {
        return null;
    }
    return <ReceiverInput>
        <TouchableOpacity onPress={onPress}>
            <ShowMore 
                data={names}
                renderLeft={() => <ReceiverInputPrefix>{I18n.t("conversation-receiverPrefixInput")}</ReceiverInputPrefix>}
                renderEllipsis={(count) => <UserLabel> +{count}</UserLabel>}
                renderItem={(index, value, props) => {
                    return (
                        <View
                            style={{
                                backgroundColor: CommonStyles.primaryLight,
                                borderRadius: 3,
                                padding: 5,
                                maxWidth: "100%",
                                marginHorizontal: 3,
                                marginVertical: 5,    
                            }}
                        >
                            <UserLabel 
                                key={"UserLabel_" + index}
                                style={{ maxWidth: props.maxWidth }}
                                numberOfLines={1}
                            >
                                {value}
                            </UserLabel>
                        </View>
                    )
                }}
            />
        </TouchableOpacity>
    </ReceiverInput>
}

const ReceiverInputPrefix = style.text({
    lineHeight: 40,
    paddingLeft: 24,
    paddingRight: 10
});
const ReceiverInput = style.view({
    backgroundColor: CommonStyles.tabBottomColor,
    borderTopColor: CommonStyles.borderColorLighter,
    borderTopWidth: 1,
    elevation: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start"
});