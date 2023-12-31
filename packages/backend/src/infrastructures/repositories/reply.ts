import { User } from "@domains/entities/user";
import { Reply } from "@domains/entities/reply";
import { Comment } from "@domains/entities/comment"
import { ReplyCommentMethodDTO } from "@api/endpoints/reply/dtos/reply-comment-method";

export class ReplyRepository {
  deleteAllByUserId: (user_id: User['id']) => Promise<void>;
  reply: (payload: ReplyCommentMethodDTO) => Promise<Reply>;
  deleteAllByCommentId: (comment_id: Comment['id']) => Promise<void>;
  getRepliesByCommentId: (comment_id: Comment['id']) => Promise<Reply[]>;
  updatePhotoFromAllRepliesByUserID: (user_id: User['id'], filename: User['photo_filename']) => Promise<void>
}
