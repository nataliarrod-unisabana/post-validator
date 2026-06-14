import { ContentBlock, ContentBlockType } from '../model/ContentBlock';
import { ValidationResult } from '../model/ValidationResult';

export class ContentSanitizer {
  validateBlock(block: ContentBlock): ValidationResult {
    if (!block.content || block.content.trim().length === 0) {
      return ValidationResult.INVALID_CONTENT;
    }
    if (block.type === ContentBlockType.HTML) {
      return this.validateHtml(block.content);
    }
    if (block.type === ContentBlockType.IMAGE) {
      return this.validateImageUrl(block.content);
    }
    return ValidationResult.VALID;
  }

  private validateHtml(html: string): ValidationResult {
    if (/<script[\s\S]*?>[\s\S]*?<\/script>/i.test(html)) {
      return ValidationResult.MALFORMED_HTML;
    }
    if (/\son\w+\s*=/i.test(html)) {
      return ValidationResult.MALFORMED_HTML;
    }
    const openTags = (html.match(/<[^/][^>]*>/g) || []).length;
    const closeTags = (html.match(/<\/[^>]*>/g) || []).length;
    const selfClosing = (html.match(/<[^>]*\/>/g) || []).length;
    return openTags - selfClosing === closeTags
      ? ValidationResult.VALID
      : ValidationResult.MALFORMED_HTML;
  }

  private validateImageUrl(url: string): ValidationResult {
    return url.startsWith('http://') || url.startsWith('https://')
      ? ValidationResult.VALID
      : ValidationResult.INVALID_CONTENT;
  }
}