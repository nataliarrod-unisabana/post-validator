import { PostStatus } from './PostStatus';
import { AccessLevel } from './AccessLevel';
import { ContentBlock } from './ContentBlock';

export class Post {
  constructor(
    public readonly id: number,
    public title: string,
    public content: string,
    public authorId: number,
    public status: PostStatus = PostStatus.DRAFT,
    public accessLevel: AccessLevel = AccessLevel.PUBLIC,
    public scheduledFor: Date | null = null,
    public contentBlocks: ContentBlock[] = []
  ) {}
}
