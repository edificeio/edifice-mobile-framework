import { ImageURISource } from 'react-native';

import { ScrollViewProps } from '~/framework/components/scrollView';

export type CommunityThumbnailNavbarScrollableProps = React.PropsWithChildren<
  Pick<ScrollViewProps, 'onScroll' | 'contentContainerStyle' | 'contentInset' | 'contentOffset'> & {
    title: string;
    image: ImageURISource[];
    // ScrollComponent?: React.ComponentType<ScrollViewProps>;
  }
>;
