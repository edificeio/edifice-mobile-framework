import { ScrollViewProps } from '~/framework/components/scrollView';

export type CommunityThumbnailNavbarScrollableProps = React.PropsWithChildren<
  Pick<ScrollViewProps, 'onScroll' | 'contentContainerStyle' | 'contentInset' | 'contentOffset'> & {
    title: string;
    image: string | undefined;
    // ScrollComponent?: React.ComponentType<ScrollViewProps>;
  }
>;
