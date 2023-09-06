import { CardTopContentProps } from '~/framework/components/card/top-content/types';

export interface CardTopContentCategoryProps extends Omit<CardTopContentProps, 'text' | 'image' | 'bold' | 'textColor'> {
  category: string;
}
