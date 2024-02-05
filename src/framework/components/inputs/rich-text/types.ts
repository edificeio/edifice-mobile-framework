export interface RichEditorFormProps {
  elements: Element;
  initialContentHtml: string;
  onChangeText: (html: string) => void;
}
