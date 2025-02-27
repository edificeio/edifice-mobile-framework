import { ImageStyle } from 'react-native';

import { Asset } from '~/framework/util/fileHandler/types';
import { AnyNavigableModuleConfig } from '~/framework/util/moduleTool';

export interface ImageInputProps {
    moduleConfig: AnyNavigableModuleConfig;
    moduleImageStyle?: ImageStyle;
    onChange: (value: Pick<Asset, 'uri'> | undefined) => void;
    style?: ImageStyle;
    value: Pick<Asset, 'uri'> | undefined;
}
