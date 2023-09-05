import { createPost } from "./create-post";
import { createUser } from "./create-user";
import { Post } from "@domains/entities/post";
import { User } from "@domains/entities/user";
import { Comment } from "@domains/entities/comment";
import { createRandonString } from "./create_random_string";

export const createComment = (post_id: Post['id'], user_id: User['id']): Comment => {
  const user = createUser(user_id)

  return {
    id: createRandonString(),
    comment: 'Some post comment',
    post: createPost(user_id, post_id),
    user,
    user_id: user.id
  }
}
