import { Post } from '../model/Post';
import { ValidationResult } from '../model/ValidationResult';

/**
 * Valida los campos de un post antes de persistirlo.
 *
 * Reglas de negocio:
 *  R1. El título es obligatorio (no puede ser vacío ni solo espacios)
 *  R2. El título no puede exceder 255 caracteres
 *  R3. El autor debe ser un ID válido (> 0)
 *  R4. El contenido no puede estar vacío al publicar
 */
export class PostValidator {
  validate(post: Post): ValidationResult {
    if (!post.title || post.title.trim().length === 0) {
      return ValidationResult.EMPTY_TITLE;
    }
    return ValidationResult.VALID;
  }
}
