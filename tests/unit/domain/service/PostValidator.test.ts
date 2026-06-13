import { PostValidator } from '../../../../src/domain/service/PostValidator';
import { Post } from '../../../../src/domain/model/Post';
import { ValidationResult } from '../../../../src/domain/model/ValidationResult';

describe('PostValidator', () => {

  it('should return VALID when post has all required fields', () => {
    // Arrange
    const validator = new PostValidator();
    const post = new Post(1, 'Mi primer post', 'Contenido del post', 100);

    // Act
    const result = validator.validate(post);

    // Assert
    expect(result).toBe(ValidationResult.VALID);
  });

});