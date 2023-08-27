import { Post } from '@domains/entities/post';
import { Follow } from '@domains/entities/follow';
import { createPost } from '../../../../utils/create-post';
import { createUser } from '../../../../utils/create-user';
import { createFollow } from '../../../../utils/create-follow';
import { LikeRepository } from '@infrastructures/repositories/like';
import { PostRepository } from "@infrastructures/repositories/post";
import { UserRepository } from "@infrastructures/repositories/user";
import { ListPostsService } from '@api/endpoints/post/services/list';
import { FollowRepository } from "@infrastructures/repositories/follow";
import { TypeormPostRepository } from '@infrastructures/typeorm/repositories/post';
import { TypeormUserRepository } from '@infrastructures/typeorm/repositories/user';
import { ApiRequestError } from '@infrastructures/error-handling/api-request-error';
import { TypeormFollowRepository } from "@infrastructures/typeorm/repositories/follow";
import { MockClass, createMockFromClass } from "../../../../utils/create-mock-from-class";
import { TypeormLikeRepository } from '@infrastructures/typeorm/repositories/like';

let postRepository: MockClass<PostRepository>;
let userRepository: MockClass<UserRepository>;
let followRepository: MockClass<FollowRepository>;
let likeRepository: MockClass<LikeRepository>;

describe("SERVICE - ListPost", () => {
  const USER = createUser();
  const POSTS: Post[] = [createPost(USER.id)];
  const FOLLOWERS: Follow[] = [createFollow(USER.id)];

  let service: ListPostsService;

  beforeEach(() => {
    postRepository = createMockFromClass(TypeormPostRepository as any);
    userRepository = createMockFromClass(TypeormUserRepository as any);
    likeRepository = createMockFromClass(TypeormLikeRepository as any);
    followRepository = createMockFromClass(TypeormFollowRepository as any);
    service = new ListPostsService(userRepository, postRepository, followRepository, likeRepository);

    likeRepository.getLikes.mockReturnValue([]);
    userRepository.findById.mockReturnValue(USER);
    followRepository.getFollowings.mockReturnValue(FOLLOWERS);
    postRepository.getFeedPosts.mockReturnValue(POSTS);
  });

  describe("Successful cases", () => {
    it("should return the posts for a valid user", async () => {
      const result = await service.execute(USER.id);
      expect(result).toEqual(POSTS);
      expect(userRepository.findById).toHaveBeenCalledWith(USER.id);
      expect(followRepository.getFollowings).toHaveBeenCalledWith(USER.id);
      expect(postRepository.getFeedPosts).toHaveBeenCalledWith([...FOLLOWERS.map(follow => follow.following_id), USER.id]);
    });
  });

  describe("Error cases", () => {
    it("should throw an error when the user is not found", async () => {
      userRepository.findById.mockReturnValue(null);
      await expect(service.execute("non-existent-user-id")).rejects.toThrow(ApiRequestError);
    });
  });
});
