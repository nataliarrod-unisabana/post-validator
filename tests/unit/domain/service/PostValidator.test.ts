import { PostValidator } from '../../../../src/domain/service/PostValidator';
import { Post } from '../../../../src/domain/model/Post';
import { ValidationResult } from '../../../../src/domain/model/ValidationResult';
import { PostStatus } from '../../../../src/domain/model/PostStatus';

describe('PostValidator', () => {

  it('should return VALID when post has all required fields', () => {
    const validator = new PostValidator();
    const post = new Post(1, 'Mi primer post', 'Contenido del post', 100);
    const result = validator.validate(post);
    expect(result).toBe(ValidationResult.VALID);
  });

  it('should return EMPTY_TITLE when title is only whitespace', () => {
    const validator = new PostValidator();
    const post = new Post(1, '   ', 'Contenido', 100);
    const result = validator.validate(post);
    expect(result).toBe(ValidationResult.EMPTY_TITLE);
  });

  it('should return TITLE_TOO_LONG when title exceeds 255 characters', () => {
    const validator = new PostValidator();
    const post = new Post(1, 'a'.repeat(256), 'Contenido', 100);
    const result = validator.validate(post);
    expect(result).toBe(ValidationResult.TITLE_TOO_LONG);
  });

  it('should return VALID when title has exactly 255 characters', () => {
    const validator = new PostValidator();
    const post = new Post(1, 'a'.repeat(255), 'Contenido', 100);
    const result = validator.validate(post);
    expect(result).toBe(ValidationResult.VALID);
  });

  it('should return INVALID_AUTHOR when authorId is zero', () => {
    const validator = new PostValidator();
    const post = new Post(1, 'Título válido', 'Contenido', 0);
    const result = validator.validate(post);
    expect(result).toBe(ValidationResult.INVALID_AUTHOR);
  });

  it('should return INVALID_AUTHOR when authorId is negative', () => {
    const validator = new PostValidator();
    const post = new Post(1, 'Título válido', 'Contenido', -5);
    const result = validator.validate(post);
    expect(result).toBe(ValidationResult.INVALID_AUTHOR);
  });

  it('should return INVALID_CONTENT when content is empty and status is PUBLISHED', () => {
    const validator = new PostValidator();
    const post = new Post(1, 'Título válido', '', 100, PostStatus.PUBLISHED);
    const result = validator.validate(post);
    expect(result).toBe(ValidationResult.INVALID_CONTENT);
  });

});