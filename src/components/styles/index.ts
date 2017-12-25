import { Dimensions, Platform, StyleSheet } from 'react-native'
import { layoutSize } from '../../constants/layoutSize'

export const deviceWidth = Dimensions.get('window').width

const widthDuration = deviceWidth - layoutSize.LAYOUT_4 - layoutSize.LAYOUT_20
const widthCalendar = Math.round((widthDuration - layoutSize.LAYOUT_4) * 2 / 3)

export const annulOrangeActionColor = '#ee6633'
export const cardGreenBorderColor = '#00ff0020'
export const cardGreenBackgroundColor = '#00ff0022'
export const cardOrangeBorderColor = '#ff800020'
export const cardOrangeBackgroundColor = '#ff800022'
export const cardRedBorderColor = '#ff000020'
export const cardRedBackgroundColor = '#ff000077'
export const colorDisabled = '#44444444'
export const backgroundColor = 'transparent'
export const backgroundColorDisabled = '#f2f2f270'
export const borderColor = '#cccccc'
export const errorColor = '#ff0000'
export const fadColor = '#444444'
export const inverseColor = '#ffffff'
export const inputBackColor = '#ffffff'
export const navigationColor = '#2a97f5'
export const separatorColor = '#a0a0ff'
export const placeholderColor = '#33333399'
export const titleColor = '#1467ff'
export const actionColor = '#33e059'
export const selectColor = '#ffff00'
export const surName = '#225577'
export const textColor = '#222222'
export const textNavigationColor = '#ffffff'
export const topicBackgroundColor = '#ffffff'
export const appBackgroundColor = 'transparent'

export const buttonColor = inputBackColor
export const cardBackgroundColor = backgroundColor
export const cardBackgroundColorDisabled = backgroundColorDisabled
export const cardTitle = titleColor
export const color = textColor
export const containerBackgroundColor = backgroundColor
export const linkColor = navigationColor
export const statusSystemBarColor = navigationColor
export const tabBackgroundColor = navigationColor
export const textInputColor = textColor
export const title = titleColor
export const validActionColor = actionColor
export const validActionColorDisabled = colorDisabled
export const annulRedActionColor = errorColor

const styles = StyleSheet.create({
  Disable: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#bbbbbbbb',
  },
  annulerCardBank: {
    marginTop: layoutSize.LAYOUT_4,
    color: inverseColor,
    backgroundColor: annulOrangeActionColor,
    fontSize: layoutSize.LAYOUT_8,
    padding: layoutSize.LAYOUT_6,
    fontWeight: '600',
  },
  annulerOrangeButtonStyle: {
    alignSelf: 'center',
    color: inverseColor,
    backgroundColor: annulOrangeActionColor,
    fontSize: layoutSize.LAYOUT_7,
    padding: layoutSize.LAYOUT_4,
    fontWeight: '600',
  },
  annulerRedButtonStyle: {
    alignSelf: 'center',
    color: inverseColor,
    backgroundColor: annulRedActionColor,
    fontSize: layoutSize.LAYOUT_7,
    padding: layoutSize.LAYOUT_4,
    fontWeight: '600',
  },
  annulerVertButtonStyle: {
    alignSelf: 'center',
    backgroundColor: validActionColor,
    color: inverseColor,
    fontSize: layoutSize.LAYOUT_7,
    fontWeight: '600',
    padding: layoutSize.LAYOUT_4,
  },
  authTitle: {
    color: '#333333',
    fontSize: layoutSize.LAYOUT_14,
    paddingTop: layoutSize.LAYOUT_6,
  },
  avatar: {
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  borderDark: {
    borderWidth: 1,
    borderColor: '#cccccc',
    height: 1,
  },
  borderLight: {
    borderWidth: 1,
    borderColor: '#f3f3f3',
    height: 1,
  },
  borderUltraLight: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: 1,
  },
  buttonStyle: {
    alignSelf: 'center',
    color: inverseColor,
    backgroundColor: buttonColor,
    fontSize: layoutSize.LAYOUT_7,
    padding: layoutSize.LAYOUT_2,
    fontWeight: '600',
  },
  calendar: {
    width: widthCalendar,
  },
  card: {
    borderRadius: 3,
    paddingRight: layoutSize.LAYOUT_10,
    overflow: 'hidden',
  },
  cardDescription: {
    color: color,
    marginTop: layoutSize.LAYOUT_3,
    fontSize: layoutSize.LAYOUT_6,
    marginBottom: layoutSize.LAYOUT_3,
  },
  cardImage: {
    height: layoutSize.LAYOUT_70,
    width: layoutSize.LAYOUT_60,
    borderRadius: layoutSize.LAYOUT_3,
    marginRight: layoutSize.LAYOUT_4,
  },
  cardMiniImage: {
    alignItems: 'center',
    margin: layoutSize.LAYOUT_1,
    marginRight: layoutSize.LAYOUT_4,
    height: layoutSize.LAYOUT_70,
    width: layoutSize.LAYOUT_60,
  },
  cardSmallImage: {
    width: layoutSize.LAYOUT_50,
    height: layoutSize.LAYOUT_60,
    borderRadius: layoutSize.LAYOUT_25,
    marginRight: layoutSize.LAYOUT_10,
  },
  cardSmallText: {
    color: '#777777',
    fontSize: layoutSize.LAYOUT_5,
    fontWeight: '200',
  },
  cardStarRatings: {
    marginLeft: layoutSize.LAYOUT_4,
    fontSize: layoutSize.LAYOUT_6,
    color: actionColor,
  },
  cardSurname: {
    color: surName,
    fontSize: layoutSize.LAYOUT_6,
    fontWeight: '500',
  },
  cardSurnameBig: {
    color: surName,
    fontSize: layoutSize.LAYOUT_10,
    fontWeight: '500',
  },
  cardText: {
    color: 'black',
    fontSize: layoutSize.LAYOUT_10,
  },
  cardTextInput: {
    height: layoutSize.LAYOUT_40,
  },
  cardTitle: {
    color: cardTitle,
    fontSize: layoutSize.LAYOUT_7,
    fontWeight: '600',
    paddingTop: layoutSize.LAYOUT_2,
    paddingBottom: layoutSize.LAYOUT_2,
    textAlign: 'left',
  },
  cardVerySmallImage: {
    width: layoutSize.LAYOUT_32,
    height: layoutSize.LAYOUT_32,
    borderRadius: layoutSize.LAYOUT_16,
    marginRight: layoutSize.LAYOUT_5,
  },
  clientCard: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  conference: {
    color: textColor,
    fontSize: layoutSize.LAYOUT_7,
    fontWeight: '500',
  },
  containerAppels: {
    backgroundColor: 'transparent',
    padding: layoutSize.LAYOUT_2,
    borderBottomColor: separatorColor,
    borderBottomWidth: 1,
  },
  containerAppelsDisabled: {
    backgroundColor: cardBackgroundColorDisabled,
    padding: layoutSize.LAYOUT_2,
    borderBottomColor: separatorColor,
    borderBottomWidth: 1,
  },
  containerAuth: {
    backgroundColor: containerBackgroundColor,
    padding: layoutSize.LAYOUT_4,
    paddingTop: layoutSize.LAYOUT_10,
    justifyContent: 'center',
  },
  containerBorderBottom: {
    borderBottomWidth: 1,
    borderColor: '#dddddd',
    backgroundColor: 'transparent',
    padding: layoutSize.LAYOUT_4,
    marginBottom: layoutSize.LAYOUT_8,
  },
  containerBorderTop: {
    borderTopWidth: 1,
    borderColor: '#dddddd',
    backgroundColor: 'transparent',
    padding: layoutSize.LAYOUT_4,
  },
  containerCard: {
    backgroundColor: 'transparent',
    borderBottomColor: separatorColor,
    borderBottomWidth: 1,
    paddingRight: layoutSize.LAYOUT_1,
  },
  containerCenter: {
    backgroundColor: '#3399ff',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  containerCreditCard: {
    backgroundColor: 'transparent',
    padding: layoutSize.LAYOUT_10,
  },
  containerErrorText: {
    alignSelf: 'center',
    fontWeight: '400',
    color: errorColor,
  },
  containerInfo: {
    backgroundColor: saturate('#fcfcfc', 0.9),
    minHeight: layoutSize.LAYOUT_12,
    flexWrap: 'wrap',
    padding: layoutSize.LAYOUT_3,
  },
  containerInfoText: {
    color: 'green',
    alignSelf: 'center',
  },
  containerNoBorder: {
    backgroundColor: 'transparent',
    padding: layoutSize.LAYOUT_4,
  },
  containerPlanifierAppel: {
    backgroundColor: 'transparent',
  },
  countryName: {
    color: color,
    fontSize: layoutSize.LAYOUT_6,
    marginRight: layoutSize.LAYOUT_3,
  },
  creneauText: {
    color: inputBackColor,
    fontSize: layoutSize.LAYOUT_6,
    fontWeight: '400',
  },
  creneauTextBold: {
    color: inputBackColor,
    fontSize: layoutSize.LAYOUT_6,
    fontWeight: '500',
  },
  dureeAppel: {
    width: widthDuration,
  },
  expertCard: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  expertHeaderContainer: {
    backgroundColor: 'transparent',
  },
  height40: {
    height: layoutSize.LAYOUT_40,
  },
  height25: {
    height: layoutSize.LAYOUT_25,
  },
  identifier: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  inputCard: {
    backgroundColor: inputBackColor,
    borderColor,
    borderWidth: 1,
    marginRight: layoutSize.LAYOUT_4,
    paddingLeft: layoutSize.LAYOUT_10,
  },
  inputError: {
    color: 'red',
    fontSize: layoutSize.LAYOUT_6,
    fontWeight: '800',
    marginBottom: layoutSize.LAYOUT_4,
  },
  link: {
    textDecorationLine: 'underline',
    marginTop: layoutSize.LAYOUT_8,
  },
  linkColor: {
    color: linkColor,
    fontWeight: '600',
    marginTop: layoutSize.LAYOUT_8,
    textDecorationLine: 'underline',
  },
  linkMargin: {
    marginTop: layoutSize.LAYOUT_8,
  },
  linkMarginLeft: {
    textDecorationLine: 'underline',
    marginLeft: layoutSize.LAYOUT_8,
    color: '#333333',
  },
  loading: {
    backgroundColor: '#ff5000',
    height: layoutSize.LAYOUT_2,
  },
  marginCenterForm: {
    marginTop: layoutSize.LAYOUT_4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  marginTop: {
    marginTop: layoutSize.LAYOUT_6,
  },
  payment: {
    backgroundColor: inputBackColor,
    borderColor,
    borderRadius: 3,
    borderWidth: 1,
    height: layoutSize.LAYOUT_25,
    width: '100%',
  },
  status7Text: {
    color: fadColor,
    fontSize: layoutSize.LAYOUT_5,
    fontWeight: '400',
  },
  statusText: {
    color: fadColor,
    fontSize: layoutSize.LAYOUT_5,
    fontWeight: '300',
  },
  statutAppel: {
    alignItems: 'center',
    backgroundColor: cardBackgroundColor,
    borderColor,
    borderRadius: layoutSize.LAYOUT_2,
    borderWidth: 1,
    justifyContent: 'center',
    margin: layoutSize.LAYOUT_1,
    padding: layoutSize.LAYOUT_2,
  },
  statutAppelGreen: {
    alignItems: 'center',
    backgroundColor: cardGreenBackgroundColor,
    borderColor: cardGreenBorderColor,
    borderRadius: layoutSize.LAYOUT_2,
    borderWidth: 1,
    justifyContent: 'center',
    margin: layoutSize.LAYOUT_1,
    padding: layoutSize.LAYOUT_2,
  },
  statutAppelOrange: {
    alignItems: 'center',
    backgroundColor: cardOrangeBackgroundColor,
    borderColor: cardOrangeBorderColor,
    borderRadius: layoutSize.LAYOUT_2,
    borderWidth: 1,
    justifyContent: 'center',
    margin: layoutSize.LAYOUT_1,
    padding: layoutSize.LAYOUT_2,
  },
  statutAppelRed: {
    alignItems: 'center',
    backgroundColor: cardRedBackgroundColor,
    borderColor: cardRedBorderColor,
    borderRadius: layoutSize.LAYOUT_2,
    borderWidth: 1,
    justifyContent: 'center',
    margin: layoutSize.LAYOUT_1,
    padding: layoutSize.LAYOUT_2,
  },
  tarifHoraire: {
    color: textColor,
    fontSize: layoutSize.LAYOUT_8,
  },
  tarifHoraireButton: {
    color: title,
    fontSize: layoutSize.LAYOUT_7,
    fontWeight: '600',
    marginBottom: layoutSize.LAYOUT_2,
    paddingLeft: layoutSize.LAYOUT_10,
  },
  textInput: {
    color: textInputColor,
    fontSize: Platform.OS === 'ios' ? layoutSize.LAYOUT_7 : layoutSize.LAYOUT_8,
  },
  textInputMulti: {
    color: textInputColor,
    fontSize: Platform.OS === 'ios' ? layoutSize.LAYOUT_7 : layoutSize.LAYOUT_8,
    height: layoutSize.LAYOUT_50,
  },
  dropdownStyle: {
    backgroundColor: inputBackColor,
    height: layoutSize.LAYOUT_140,
  },
  textInputWrapper: {
    backgroundColor: inputBackColor,
    borderColor,
    borderRadius: 3,
    borderWidth: 1,
    padding: Platform.OS === 'ios' ? layoutSize.LAYOUT_3 : layoutSize.LAYOUT_0,
  },
  textInputErrorWrapper: {
    backgroundColor: inputBackColor,
    borderColor: errorColor,
    borderRadius: 3,
    borderWidth: 1,
    padding: Platform.OS === 'ios' ? layoutSize.LAYOUT_3 : layoutSize.LAYOUT_0,
  },
  pickerWrapper: {
    backgroundColor: inputBackColor,
    borderColor,
    borderRadius: 3,
    borderWidth: 1,
    paddingTop: Platform.OS === 'ios' ? layoutSize.LAYOUT_3 : layoutSize.LAYOUT_0,
    paddingBottom: Platform.OS === 'ios' ? layoutSize.LAYOUT_3 : layoutSize.LAYOUT_0,
  },
  title: {
    color: title,
    fontSize: layoutSize.LAYOUT_8,
    fontWeight: '600',
    marginBottom: layoutSize.LAYOUT_2,
  },
  titleText: {
    color: title,
    alignSelf: 'center',
    fontSize: layoutSize.LAYOUT_12,
    fontWeight: '600',
  },
  titleTextWhite: {
    color: 'white',
    alignSelf: 'center',
    fontSize: layoutSize.LAYOUT_12,
    fontWeight: '600',
  },
  topic: {
    backgroundColor: '#f6f6ff',
    paddingLeft: 3,
    paddingRight: 3,
    marginRight: layoutSize.LAYOUT_2,
    marginBottom: 3,
    borderWidth: 1,
    borderColor,
    borderRadius: layoutSize.LAYOUT_2,
    color: '#333333',
    fontSize: layoutSize.LAYOUT_6,
    fontWeight: '200',
  },
  topics: {
    backgroundColor: '#f6f6ff',
    padding: 3,
    marginRight: layoutSize.LAYOUT_2,
    marginBottom: 3,
    borderWidth: 1,
    borderColor,
    borderRadius: layoutSize.LAYOUT_2,
    color: '#333333',
    fontSize: layoutSize.LAYOUT_6,
    fontWeight: '200',
  },
  topicAvis: {
    padding: layoutSize.LAYOUT_4,
    backgroundColor: topicBackgroundColor,
    fontSize: layoutSize.LAYOUT_7,
    marginBottom: layoutSize.LAYOUT_2,
    marginTop: layoutSize.LAYOUT_2,
  },
  topicMesAppels: {
    padding: layoutSize.LAYOUT_4,
    backgroundColor: topicBackgroundColor,
    marginBottom: layoutSize.LAYOUT_2,
    marginTop: layoutSize.LAYOUT_2,
  },
  topicTitle: {
    color: '#777799',
    fontSize: layoutSize.LAYOUT_7,
    fontWeight: '500',
    marginTop: layoutSize.LAYOUT_4,
    marginBottom: layoutSize.LAYOUT_2,
  },
  topicTitleBig: {
    color: '#777799',
    fontSize: layoutSize.LAYOUT_8,
    fontWeight: '500',
    marginTop: layoutSize.LAYOUT_4,
    marginLeft: layoutSize.LAYOUT_4,
  },
  touchableAction: {
    backgroundColor: inputBackColor,
    borderColor,
    borderWidth: 1,
    borderRadius: 3,
    height: layoutSize.LAYOUT_25,
    paddingTop: layoutSize.LAYOUT_7,
    paddingLeft: layoutSize.LAYOUT_4,
  },
  touchableActionSmall: {
    alignItems: 'center',
    backgroundColor: actionColor,
    height: layoutSize.LAYOUT_20,
    justifyContent: 'center',
    marginRight: layoutSize.LAYOUT_1,
  },
  touchableActionSmallAccept: {
    alignItems: 'center',
    backgroundColor: navigationColor,
    borderWidth: 1,
    borderRadius: 3,
    height: layoutSize.LAYOUT_20,
    justifyContent: 'center',
    marginRight: layoutSize.LAYOUT_1,
  },
  underlineText: {
    color: 'white',
    textDecorationLine: 'underline',
    alignSelf: 'center',
    fontSize: layoutSize.LAYOUT_10,
    fontWeight: '600',
  },
  underlineTextWhite: {
    color: 'white',
    textDecorationLine: 'underline',
    alignSelf: 'center',
    fontSize: layoutSize.LAYOUT_10,
    fontWeight: '600',
  },
  validButtonStyle: {
    alignSelf: 'center',
    backgroundColor: validActionColor,
    color: inverseColor,
    fontSize: layoutSize.LAYOUT_8,
    padding: layoutSize.LAYOUT_6,
    fontWeight: '600',
  },
  validButtonStyleDisabled: {
    alignSelf: 'center',
    backgroundColor: validActionColorDisabled,
    color: inverseColor,
    fontSize: layoutSize.LAYOUT_8,
    padding: layoutSize.LAYOUT_6,
    fontWeight: '600',
  },
  validTextIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: layoutSize.LAYOUT_3,
  }
})

export default styles

function saturate(color, percent) {
  let R = parseInt(color.substring(1, 3), 16)
  let G = parseInt(color.substring(3, 5), 16)
  let B = parseInt(color.substring(5, 7), 16)
  R = parseInt(R * percent)
  G = parseInt(G * percent)
  B = parseInt(B * percent)
  R = R < 255 ? R : 255
  G = G < 255 ? G : 255
  B = B < 255 ? B : 255
  let r = R.toString(16).length === 1 ? '0' + R.toString(16) : R.toString(16)
  let g = G.toString(16).length === 1 ? '0' + G.toString(16) : G.toString(16)
  let b = B.toString(16).length === 1 ? '0' + B.toString(16) : B.toString(16)
  return `#${r + g + b}`
}
