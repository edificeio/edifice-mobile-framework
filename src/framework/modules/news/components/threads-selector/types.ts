import { NewsThreadItem } from '~/framework/modules/news/model';

export interface ThreadsSelectorProps {
  threads: NewsThreadItem[];
  isFiltering: boolean;
  onSelect: (id: number | null) => void;
}
