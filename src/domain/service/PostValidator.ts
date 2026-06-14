import { Post } from '../model/Post';
import { PostStatus } from '../model/PostStatus';
import { ValidationResult } from '../model/ValidationResult';

const MAX_TITLE_LENGTH = 255;

export class PostValidator {
  validate(post: Post): ValidationResult {
    if (!post.title || post.title.trim().length === 0) {
      return ValidationResult.EMPTY_TITLE;
    }
    if (post.title.trim().length > MAX_TITLE_LENGTH) {
      return ValidationResult.TITLE_TOO_LONG;
    }
    if (!post.authorId || post.authorId <= 0) {
      return ValidationResult.INVALID_AUTHOR;
    }
    if (post.status === PostStatus.PUBLISHED && (!post.content || post.content.trim().length === 0)) {
      return ValidationResult.INVALID_CONTENT;
    }
    return ValidationResult.VALID;
  }
}