import { StyleSheet } from "react-native"
import { StyleConf } from "./StyleConf"

export const ReadMailStyle = StyleSheet.create({
	icon: {
		margin: 10,
	},
	input: {
		backgroundColor: "#fff",
		height: 50,
		borderWidth: 0,
		borderColor: "transparent",
		flex: 1,
		margin: 2,
	},
	inputView: {
		height: 50,
		width: "100%",
		backgroundColor: "#fff",
		flexDirection: "row",
	},
	view: {
		width: "100%",
		height: "100%",
		flex: 1,
	},
	webview: {
		width: "100%",
		flex: 1,
		backgroundColor: "#eee",
	},
})

export const WebViewCSS = `
    @keyframes fadeIn{
        0%{
            opacity: 0;
        }
        100%{
            opacity: 1;
        }
    }

    .message{
        background: ${StyleConf.primary};
        color: #fff;
        padding: 15px;
        margin: 15px;
        width: 75%;
        box-sizing: border-box;
        animation: fadeIn 1 320ms;
    }

    .message *{
        background-color: transparent !important;
        font-family: Roboto !important;
        text-decoration: none !important;
    }

    img{
        max-width: 100%;
    }
`
