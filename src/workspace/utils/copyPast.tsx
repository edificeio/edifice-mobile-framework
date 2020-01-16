type ClipboardContent = {
  value: string[];
};

const clipboardContent: ClipboardContent = {
  value: [],
};

export class ClipboardWorkspace {
  static set(payload: string[]): void {
    clipboardContent.value = payload;
  }

  static get(): string[] {
    return clipboardContent.value;
  }

  static isEmpty(): boolean {
    return clipboardContent.value.length > 0;
  }
}
