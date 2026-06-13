import { Post } from '../domain/model/Post';
import { PostStatus } from '../domain/model/PostStatus';
import { UserType } from '../domain/model/UserType';
import { ValidationResult } from '../domain/model/ValidationResult';
import { PostValidator } from '../domain/service/PostValidator';
import { PostScheduler } from '../domain/service/PostScheduler';
import { AccessControlService } from '../domain/service/AccessControlService';
import { PostRepository } from './PostRepository';

export interface CreatePostResult {
  success: boolean;
  post?: Post;
  error?: ValidationResult;
}

export class PostService {
  constructor(
    private readonly repository: PostRepository,
    private readonly validator: PostValidator = new PostValidator(),
    private readonly scheduler: PostScheduler = new PostScheduler(),
    private readonly accessControl: AccessControlService = new AccessControlService()
  ) {}

  createPost(post: Post): CreatePostResult {
    const validation = this.validator.validate(post);
    if (validation !== ValidationResult.VALID) {
      return { success: false, error: validation };
    }

    if (post.status === PostStatus.SCHEDULED && post.scheduledFor) {
      const scheduleValidation = this.scheduler.validateScheduledDate(post.scheduledFor);
      if (scheduleValidation !== ValidationResult.VALID) {
        return { success: false, error: scheduleValidation };
      }
    }

    const saved = this.repository.save(post);
    return { success: true, post: saved };
  }

  getPost(id: number, userType: UserType = UserType.ANONYMOUS): Post | null {
    const post = this.repository.findById(id);
    if (!post) return null;
    if (!this.accessControl.canAccess(post, userType)) return null;
    return post;
  }

  listPosts(): Post[] {
    return this.repository.findAll();
  }

  deletePost(id: number): boolean {
    return this.repository.delete(id);
  }
}
