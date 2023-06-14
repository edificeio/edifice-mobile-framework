import { NewsThreadItem } from '~/framework/modules/newsv2/model';

export interface ThreadsSelectorProps {
  threads: NewsThreadItem[];
  onSelect: (id: number | null) => void;
}
