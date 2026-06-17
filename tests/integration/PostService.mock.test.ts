import { PostService } from '../../src/application/PostService';
import { PostRepository } from '../../src/application/PostRepository';
import { Post } from '../../src/domain/model/Post';
import { PostStatus } from '../../src/domain/model/PostStatus';
import { AccessLevel } from '../../src/domain/model/AccessLevel';
import { ValidationResult } from '../../src/domain/model/ValidationResult';
import { UserType } from '../../src/domain/model/UserType';

describe('PostService — Integración con Mock Repository', () => {

  let mockRepository: jest.Mocked<PostRepository>;
  let service: PostService;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
      clear: jest.fn(),
    };
    service = new PostService(mockRepository);
  });

  const validPost = (): Post => new Post(
    0, 'Título válido', 'Contenido', 1,
    PostStatus.DRAFT, AccessLevel.PUBLIC, null
  );

  it('should call repository.save when post is valid', () => {
    // Arrange
    const post = validPost();
    const savedPost = new Post(1, post.title, post.content, post.authorId, post.status, post.accessLevel, null);
    mockRepository.save.mockReturnValue(savedPost);
    // Act
    const result = service.createPost(post);
    // Assert
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(true);
  });

  it('should NOT call repository.save when post has empty title', () => {
    // Arrange
    const post = new Post(0, '', 'Contenido', 1, PostStatus.DRAFT, AccessLevel.PUBLIC, null);
    // Act
    const result = service.createPost(post);
    // Assert
    expect(mockRepository.save).not.toHaveBeenCalled();
    expect(result.error).toBe(ValidationResult.EMPTY_TITLE);
  });

  it('should NOT call repository.save when authorId is invalid', () => {
    // Arrange
    const post = new Post(0, 'Título', 'Contenido', -1, PostStatus.DRAFT, AccessLevel.PUBLIC, null);
    // Act
    const result = service.createPost(post);
    // Assert
    expect(mockRepository.save).not.toHaveBeenCalled();
    expect(result.error).toBe(ValidationResult.INVALID_AUTHOR);
  });

  it('should call repository.findById when getting a post', () => {
    // Arrange
    const post = new Post(1, 'Título', 'Contenido', 1, PostStatus.PUBLISHED, AccessLevel.PUBLIC, null);
    mockRepository.findById.mockReturnValue(post);
    // Act
    const result = service.getPost(1, UserType.ANONYMOUS);
    // Assert
    expect(mockRepository.findById).toHaveBeenCalledWith(1);
    expect(result).not.toBeNull();
  });

  it('should return null when repository.findById returns null', () => {
    // Arrange
    mockRepository.findById.mockReturnValue(null);
    // Act
    const result = service.getPost(999, UserType.ANONYMOUS);
    // Assert
    expect(result).toBeNull();
  });

  it('should call repository.delete when deleting a post', () => {
    // Arrange
    mockRepository.delete.mockReturnValue(true);
    // Act
    const result = service.deletePost(1);
    // Assert
    expect(mockRepository.delete).toHaveBeenCalledWith(1);
    expect(result).toBe(true);
  });

  it('should call repository.findAll when listing posts', () => {
    // Arrange
    mockRepository.findAll.mockReturnValue([]);
    // Act
    const result = service.listPosts();
    // Assert
    expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]);
  });
});