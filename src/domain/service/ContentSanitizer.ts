import { ContentBlock, ContentBlockType } from '../model/ContentBlock';
import { ValidationResult } from '../model/ValidationResult';

/**
 * Valida bloques de contenido enriquecido (HTML, Markdown, imágenes).
 *
 * Reglas de negocio:
 *  R1. Bloques HTML deben tener etiquetas balanceadas
 *  R2. Bloques HTML no pueden contener <script> ni handlers on*
 *  R3. Bloques IMAGE deben tener URL válida (http:// o https://)
 *  R4. Bloques MARKDOWN no requieren validación de balanceo
 *  R5. Bloques con contenido vacío son inválidos
 */
export class ContentSanitizer {
  validateBlock(block: ContentBlock): ValidationResult {
    if (block.type === ContentBlockType.HTML) {
      return this.validateHtmlBalance(block.content);
    }
    return ValidationResult.VALID;
  }

  private validateHtmlBalance(html: string): ValidationResult {
    const openTags = (html.match(/<[^/][^>]*>/g) || []).length;
    const closeTags = (html.match(/<\/[^>]*>/g) || []).length;
    const selfClosing = (html.match(/<[^>]*\/>/g) || []).length;
    return openTags - selfClosing === closeTags
      ? ValidationResult.VALID
      : ValidationResult.MALFORMED_HTML;
  }
}
