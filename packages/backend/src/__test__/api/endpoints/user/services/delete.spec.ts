import { Post } from "@domains/entities/post"
import { createUser } from "../../../../utils/create-user"
import { createPost } from "../../../../utils/create-post"
import { FileService } from "@domains/interfaces/file-service"
import { FSFileService } from "@domains/services/file/fs-service"
import { UserRepository } from "@infrastructures/repositories/user"
import { PostRepository } from "@infrastructures/repositories/post"
import { ReplyRepository } from "@infrastructures/repositories/reply"
import { FollowRepository } from "@infrastructures/repositories/follow"
import { DeleteUserService } from "@api/endpoints/user/services/delete"
import { CommentRepository } from "@infrastructures/repositories/comment"
import { TypeormPostRepository } from "@infrastructures/typeorm/repositories/post"
import { TypeormUserRepository } from "@infrastructures/typeorm/repositories/user"
import { ApiRequestError } from "@infrastructures/error-handling/api-request-error"
import { TypeormReplyRepository } from "@infrastructures/typeorm/repositories/reply"
import { TypeormFollowRepository } from "@infrastructures/typeorm/repositories/follow"
import { TypeormCommentRepository } from "@infrastructures/typeorm/repositories/comment"
import { MockClass, createMockFromClass } from "../../../../utils/create-mock-from-class"

let service: DeleteUserService
let fileService: MockClass<FileService>
let repository: MockClass<UserRepository>
let postRepository: MockClass<PostRepository>
let replyRepository: MockClass<ReplyRepository>
let followRepository: MockClass<FollowRepository>
let commentRepository: MockClass<CommentRepository>

describe("SERVICE - DeleteUser", () => {
  const USER = createUser()

  beforeEach(() => {
    fileService = createMockFromClass(FSFileService as any)
    repository = createMockFromClass(TypeormUserRepository as any)
    postRepository = createMockFromClass(TypeormPostRepository as any)
    replyRepository = createMockFromClass(TypeormReplyRepository as any)
    followRepository = createMockFromClass(TypeormFollowRepository as any)
    commentRepository = createMockFromClass(TypeormCommentRepository as any)

    service = new DeleteUserService(repository, fileService, followRepository, postRepository, commentRepository, replyRepository)
  })

  describe("Successful cases", () => {
    const FILENAME = 'filename.txt'
    let posts: Post[]

    beforeEach(() => {
      repository.findById.mockReturnValue(USER)

      posts = Array.from({ length: 10 }).map(() => createPost(USER.id))
      postRepository.getPostsByUserID.mockReturnValue(posts)
    })

    it("Must delete an user", async () => {
      await service.execute(USER.id)

      expect(repository.deleteById).toHaveBeenCalledWith(USER.id)
    })

    it("Must delete the existent user profile photo", async () => {
      repository.findById.mockReturnValueOnce({ ...USER, photo_filename: FILENAME })

      await service.execute(USER.id)

      expect(fileService.deleteFile).toHaveBeenCalledWith(FILENAME)
    })

    it("Must delete all user follow and following registre", async () => {
      repository.findById.mockReturnValueOnce({ ...USER, photo_filename: FILENAME })

      await service.execute(USER.id)

      expect(followRepository.deleteAllByUserId).toHaveBeenCalledWith(USER.id)
    })

    it("Must delete all user post photos", async () => {
      await service.execute(USER.id)

      posts.forEach((post) => {
        expect(fileService.deleteFile).toHaveBeenCalledWith(post.image)
      })
    })

    it('Must delete all user comments', async () => {
      await service.execute(USER.id)

      expect(commentRepository.deleteAllByUserId).toHaveBeenCalledWith(USER.id)
    })


    it('Must delete all user comments', async () => {
      await service.execute(USER.id)

      expect(replyRepository.deleteAllByUserId).toHaveBeenCalledWith(USER.id)
    })
  })

  describe("Error cases", () => {
    it("Must not delete a non existent user", async () => {
      repository.findById.mockReturnValue(undefined)

      await expect(service.execute('non-existent-user')).rejects.toBeInstanceOf(ApiRequestError)
    })
  })
})
