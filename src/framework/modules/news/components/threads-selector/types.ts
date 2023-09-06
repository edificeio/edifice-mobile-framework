import { NewsThreadItem } from '~/framework/modules/news/model';

export interface ThreadsSelectorProps {
  threads: NewsThreadItem[];
  onSelect: (id: number | null) => void;
}
