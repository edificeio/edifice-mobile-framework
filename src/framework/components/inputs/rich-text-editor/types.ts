export enum RichTextEditorMode {
  PREVIEW = 'PREVIEW',
  ENABLED = 'ENABLED',
  DISABLED = 'DISABLED',
}

export interface RichTextEditorProps {
  content: string | null;
  mode: RichTextEditorMode;
}
