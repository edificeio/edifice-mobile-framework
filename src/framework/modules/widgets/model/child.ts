export interface WidgetChild {
  id: string;
}

export const getChildId = (child: WidgetChild) => child.id;

export const findChild = <T extends WidgetChild>(children: T[], id?: string) => children.find(child => getChildId(child) === id);
