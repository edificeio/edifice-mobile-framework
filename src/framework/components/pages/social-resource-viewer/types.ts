import { StyleProp, ViewStyle } from 'react-native';

import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export namespace SocialResourceViewer {
  export interface Props extends Pick<NativeStackScreenProps<ParamListBase>, 'navigation'> {
    fetchResource?: () => Promise<void>;
    fetchComments?: () => Promise<void>;
    renderResource: () => React.ReactElement;
    renderPlaceholder: () => React.ReactElement;
    canAddComment: boolean;
    style?: StyleProp<ViewStyle>;
  }
}
