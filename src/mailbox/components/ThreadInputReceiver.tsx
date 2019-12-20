import * as React from "react";
import { UserLabel } from "../../ui/SearchUser";
import { CommonStyles } from "../../styles/common/styles";
import style from "glamorous-native";
import { TouchableOpacity } from "react-native";
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
                renderItem={(index, value, props) => <UserLabel key={"UserLabel_" + index} style={{ maxWidth: props.maxWidth }} numberOfLines={1}>{value}</UserLabel>}
            />
        </TouchableOpacity>
    </ReceiverInput>
}

const ReceiverInputPrefix = style.text({
    height: 30,
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