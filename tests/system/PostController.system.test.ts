import request from 'supertest';
import express, { Express } from 'express';
import { PostService } from '../../src/application/PostService';
import { InMemoryPostRepository } from '../../src/infrastructure/InMemoryPostRepository';
import { buildPostRouter } from '../../src/delivery/rest/PostController';

describe('PostController — Pruebas de Sistema HTTP', () => {

  let app: Express;

  beforeEach(() => {
    // Arrange: nuevo servidor para cada test
    const repository = new InMemoryPostRepository();
    const service = new PostService(repository);
    app = express();
    app.use(express.json());
    app.use('/api', buildPostRouter(service));
  });

  // --- POST /api/posts ---

  it('should return 201 and the created post when data is valid', async () => {
    // Arrange
    const payload = {
      title: 'Mi primer post',
      content: 'Contenido del post',
      authorId: 1,
      status: 'DRAFT',
      accessLevel: 'PUBLIC',
    };
    // Act
    const response = await request(app).post('/api/posts').send(payload);
    // Assert
    expect(response.status).toBe(201);
    expect(response.body.title).toBe('Mi primer post');
    expect(response.body.id).toBeGreaterThan(0);
  });

  it('should return 400 when title is empty', async () => {
    // Arrange
    const payload = { title: '', content: 'Contenido', authorId: 1, status: 'DRAFT', accessLevel: 'PUBLIC' };
    // Act
    const response = await request(app).post('/api/posts').send(payload);
    // Assert
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('EMPTY_TITLE');
  });

  it('should return 400 when authorId is invalid', async () => {
    // Arrange
    const payload = { title: 'Título', content: 'Contenido', authorId: 0, status: 'DRAFT', accessLevel: 'PUBLIC' };
    // Act
    const response = await request(app).post('/api/posts').send(payload);
    // Assert
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('INVALID_AUTHOR');
  });

  // --- GET /api/posts ---

  it('should return 200 and an empty array when no posts exist', async () => {
    // Act
    const response = await request(app).get('/api/posts');
    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('should return 200 and all created posts', async () => {
    // Arrange
    await request(app).post('/api/posts').send({
      title: 'Post 1', content: 'Contenido', authorId: 1, status: 'DRAFT', accessLevel: 'PUBLIC',
    });
    await request(app).post('/api/posts').send({
      title: 'Post 2', content: 'Contenido', authorId: 1, status: 'DRAFT', accessLevel: 'PUBLIC',
    });
    // Act
    const response = await request(app).get('/api/posts');
    // Assert
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });

  // --- GET /api/posts/:id ---

  it('should return 200 and the post when found by id', async () => {
    // Arrange
    const created = await request(app).post('/api/posts').send({
      title: 'Post', content: 'Contenido', authorId: 1, status: 'DRAFT', accessLevel: 'PUBLIC',
    });
    // Act
    const response = await request(app).get(`/api/posts/${created.body.id}`);
    // Assert
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(created.body.id);
  });

  it('should return 404 when post does not exist', async () => {
    // Act
    const response = await request(app).get('/api/posts/9999');
    // Assert
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('NOT_FOUND');
  });

  it('should return 400 when id is not a number', async () => {
    // Act
    const response = await request(app).get('/api/posts/abc');
    // Assert
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('INVALID_ID');
  });

  // --- DELETE /api/posts/:id ---

  it('should return 204 when post is deleted', async () => {
    // Arrange
    const created = await request(app).post('/api/posts').send({
      title: 'Post', content: 'Contenido', authorId: 1, status: 'DRAFT', accessLevel: 'PUBLIC',
    });
    // Act
    const response = await request(app).delete(`/api/posts/${created.body.id}`);
    // Assert
    expect(response.status).toBe(204);
  });

  it('should return 404 when deleting non-existent post', async () => {
    // Act
    const response = await request(app).delete('/api/posts/9999');
    // Assert
    expect(response.status).toBe(404);
  });
});