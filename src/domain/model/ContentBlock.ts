export enum ContentBlockType {
  TEXT = 'TEXT',
  MARKDOWN = 'MARKDOWN',
  HTML = 'HTML',
  IMAGE = 'IMAGE',
  BUTTON = 'BUTTON'
}

export interface ContentBlock {
  type: ContentBlockType;
  content: string;
}
