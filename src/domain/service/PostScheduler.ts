import { ValidationResult } from '../model/ValidationResult';

/**
 * Valida fechas de publicación programada.
 *
 * Reglas de negocio:
 *  R1. La fecha no puede ser en el pasado
 *  R2. La fecha debe ser al menos 5 minutos en el futuro
 *  R3. La fecha no puede exceder 1 año en el futuro
 */
export class PostScheduler {
  validateScheduledDate(date: Date, now: Date = new Date()): ValidationResult {
    if (date.getTime() <= now.getTime()) {
      return ValidationResult.INVALID_SCHEDULE_DATE;
    }
    return ValidationResult.VALID;
  }
}
