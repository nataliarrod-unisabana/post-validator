import { PostService } from '../../src/application/PostService';
import { InMemoryPostRepository } from '../../src/infrastructure/InMemoryPostRepository';
import { Post } from '../../src/domain/model/Post';
import { PostStatus } from '../../src/domain/model/PostStatus';
import { AccessLevel } from '../../src/domain/model/AccessLevel';
import { ValidationResult } from '../../src/domain/model/ValidationResult';
import { UserType } from '../../src/domain/model/UserType';

describe('PostService — Integración con InMemoryRepository', () => {

  let service: PostService;

  beforeEach(() => {
    const repository = new InMemoryPostRepository();
    service = new PostService(repository);
  });

  // Arrange
  const validPost = (): Post => new Post(
    0, 'Título válido', 'Contenido del post', 1,
    PostStatus.DRAFT, AccessLevel.PUBLIC, null
  );

  // --- CASOS VÁLIDOS ---

  it('should create a valid post and return it', () => {
    // Arrange
    const post = validPost();
    // Act
    const result = service.createPost(post);
    // Assert
    expect(result.success).toBe(true);
    expect(result.post).toBeDefined();
    expect(result.post!.title).toBe('Título válido');
  });

  it('should assign a unique id to each post', () => {
    // Arrange & Act
    const result1 = service.createPost(validPost());
    const result2 = service.createPost(validPost());
    // Assert
    expect(result1.post!.id).not.toBe(result2.post!.id);
  });

  it('should list all created posts', () => {
    // Arrange
    service.createPost(validPost());
    service.createPost(validPost());
    // Act
    const posts = service.listPosts();
    // Assert
    expect(posts.length).toBe(2);
  });

  it('should retrieve a post by id', () => {
    // Arrange
    const created = service.createPost(validPost());
    // Act
    const found = service.getPost(created.post!.id, UserType.ANONYMOUS);
    // Assert
    expect(found).not.toBeNull();
    expect(found!.id).toBe(created.post!.id);
  });

  it('should delete a post by id', () => {
    // Arrange
    const created = service.createPost(validPost());
    // Act
    const deleted = service.deletePost(created.post!.id);
    // Assert
    expect(deleted).toBe(true);
    expect(service.getPost(created.post!.id, UserType.ANONYMOUS)).toBeNull();
  });

  // --- CASOS INVÁLIDOS ---

  it('should return EMPTY_TITLE when title is empty', () => {
    // Arrange
    const post = new Post(0, '', 'Contenido', 1, PostStatus.DRAFT, AccessLevel.PUBLIC, null);
    // Act
    const result = service.createPost(post);
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe(ValidationResult.EMPTY_TITLE);
  });

  it('should return INVALID_AUTHOR when authorId is zero', () => {
    // Arrange
    const post = new Post(0, 'Título', 'Contenido', 0, PostStatus.DRAFT, AccessLevel.PUBLIC, null);
    // Act
    const result = service.createPost(post);
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe(ValidationResult.INVALID_AUTHOR);
  });

  it('should return INVALID_CONTENT when publishing post without content', () => {
    // Arrange
    const post = new Post(0, 'Título', '', 1, PostStatus.PUBLISHED, AccessLevel.PUBLIC, null);
    // Act
    const result = service.createPost(post);
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe(ValidationResult.INVALID_CONTENT);
  });

  it('should return null when accessing MEMBERS post as ANONYMOUS', () => {
    // Arrange
    const post = new Post(0, 'Título', 'Contenido', 1, PostStatus.PUBLISHED, AccessLevel.MEMBERS, null);
    const created = service.createPost(post);
    // Act
    const found = service.getPost(created.post!.id, UserType.ANONYMOUS);
    // Assert
    expect(found).toBeNull();
  });

  it('should return false when deleting non-existent post', () => {
    // Act
    const deleted = service.deletePost(9999);
    // Assert
    expect(deleted).toBe(false);
  });
});