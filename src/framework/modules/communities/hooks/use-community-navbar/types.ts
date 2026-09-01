import { ImageURISource } from 'react-native';

import { ParamListBase } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScrollViewProps } from '~/framework/components/scrollView';

export type CommunityThumbnailNavbarScrollableProps = React.PropsWithChildren<
  Pick<ScrollViewProps, 'onScroll' | 'contentContainerStyle' | 'contentInset' | 'contentOffset'> & {
    title: string;
    image: ImageURISource[];
    navigation: Pick<NativeStackNavigationProp<ParamListBase>, 'setOptions'>;
    // ScrollComponent?: React.ComponentType<ScrollViewProps>;
  }
>;
