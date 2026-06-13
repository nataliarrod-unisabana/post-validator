import { PostScheduler } from '../../../../src/domain/service/PostScheduler';
import { ValidationResult } from '../../../../src/domain/model/ValidationResult';

describe('PostScheduler', () => {

  const FIXED_NOW = new Date('2026-01-15T10:00:00Z');

  it('should return VALID when date is 1 hour in the future', () => {
    const scheduler = new PostScheduler();
    const futureDate = new Date('2026-01-15T11:00:00Z');
    const result = scheduler.validateScheduledDate(futureDate, FIXED_NOW);
    expect(result).toBe(ValidationResult.VALID);
  });

  it('should return INVALID_SCHEDULE_DATE when date is in the past', () => {
    const scheduler = new PostScheduler();
    const pastDate = new Date('2026-01-15T09:00:00Z');
    const result = scheduler.validateScheduledDate(pastDate, FIXED_NOW);
    expect(result).toBe(ValidationResult.INVALID_SCHEDULE_DATE);
  });

  it('should return INVALID_SCHEDULE_DATE when date equals current moment', () => {
    const scheduler = new PostScheduler();
    const result = scheduler.validateScheduledDate(FIXED_NOW, FIXED_NOW);
    expect(result).toBe(ValidationResult.INVALID_SCHEDULE_DATE);
  });

  it('should return INVALID_SCHEDULE_DATE when date is less than 5 minutes in the future', () => {
    const scheduler = new PostScheduler();
    const tooSoon = new Date('2026-01-15T10:04:00Z'); // 4 minutos
    const result = scheduler.validateScheduledDate(tooSoon, FIXED_NOW);
    expect(result).toBe(ValidationResult.INVALID_SCHEDULE_DATE);
  });

  it('should return VALID when date is exactly 5 minutes in the future', () => {
    const scheduler = new PostScheduler();
    const fiveMin = new Date('2026-01-15T10:05:00Z');
    const result = scheduler.validateScheduledDate(fiveMin, FIXED_NOW);
    expect(result).toBe(ValidationResult.VALID);
  });

  it('should return INVALID_SCHEDULE_DATE when date exceeds 1 year in the future', () => {
    const scheduler = new PostScheduler();
    const tooFar = new Date('2027-01-16T10:00:00Z'); // 1 año + 1 día
    const result = scheduler.validateScheduledDate(tooFar, FIXED_NOW);
    expect(result).toBe(ValidationResult.INVALID_SCHEDULE_DATE);
  });

  it('should return VALID when date is exactly 1 year in the future', () => {
    const scheduler = new PostScheduler();
    const oneYear = new Date('2027-01-15T10:00:00Z');
    const result = scheduler.validateScheduledDate(oneYear, FIXED_NOW);
    expect(result).toBe(ValidationResult.VALID);
  });

});