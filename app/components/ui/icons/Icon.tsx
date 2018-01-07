
import { createIconSetFromIcoMoon } from 'react-native-vector-icons';
const icoMoonConfig = require( '../../../../assets/selection.json');
const iconSet = createIconSetFromIcoMoon(icoMoonConfig);

export default iconSet

//import { createIconSetFromFontello } from 'react-native-vector-icons';
//const fontelloConfig = require('../../../../assets/config.json');
//export const Icon = createIconSetFromFontello(fontelloConfig);

export interface IconProps {
    color?: any
    focused?: boolean
    name?: string,
    size?: number
}




