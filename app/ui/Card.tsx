import style from "glamorous-native"
import { CommonStyles } from "../styles/common/styles";

export const Card = style.touchableOpacity(
	{
		backgroundColor: CommonStyles.itemBackgroundColor,
		paddingHorizontal: 16,
		paddingVertical: 12,
        borderBottomColor: CommonStyles.borderBottomItem,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 1
	}
)