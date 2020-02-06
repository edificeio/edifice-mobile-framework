export type IId = {
  id: string;
};

export interface IItems<T> {
  [key: string]: T;
}