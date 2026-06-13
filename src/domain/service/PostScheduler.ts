import { ValidationResult } from '../model/ValidationResult';

const MIN_MINUTES_IN_FUTURE = 5;
const MAX_DAYS_IN_FUTURE = 365;

export class PostScheduler {
  validateScheduledDate(date: Date, now: Date = new Date()): ValidationResult {
    const diffMs = date.getTime() - now.getTime();
    const diffMinutes = diffMs / (1000 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffMinutes < MIN_MINUTES_IN_FUTURE) {
      return ValidationResult.INVALID_SCHEDULE_DATE;
    }
    if (diffDays > MAX_DAYS_IN_FUTURE) {
      return ValidationResult.INVALID_SCHEDULE_DATE;
    }
    return ValidationResult.VALID;
  }
}