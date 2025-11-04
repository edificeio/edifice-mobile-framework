export interface BaseFilter {
  id: number | string | symbol;
  isActive: boolean;
  name: string;
}

export interface FiltersListProps<T extends BaseFilter> {
  onChange: React.Dispatch<React.SetStateAction<T[]>>;
  options: T[];
  title: string;
}
