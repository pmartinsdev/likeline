import { createUser } from "../../../../utils/create-user"
import { FileService } from "@domains/interfaces/file-service"
import { FSFileService } from "@domains/services/file/fs-service"
import { PostRepository } from "@infrastructures/repositories/post"
import { UserRepository } from "@infrastructures/repositories/user"
import { FollowRepository } from "@infrastructures/repositories/follow"
import { TypeormPostRepository } from "@infrastructures/typeorm/repositories/post"
import { TypeormUserRepository } from "@infrastructures/typeorm/repositories/user"
import { ApiRequestError } from "@infrastructures/error-handling/api-request-error"
import { TypeormFollowRepository } from "@infrastructures/typeorm/repositories/follow"
import { MockClass, createMockFromClass } from "../../../../utils/create-mock-from-class"
import { UpdateProfilePhotoService } from "@api/endpoints/user/services/update-profile-photo"

let service: UpdateProfilePhotoService
let fileService: MockClass<FileService>
let userRepository: MockClass<UserRepository>
let postRepository: MockClass<PostRepository>
let followRepository: MockClass<FollowRepository>

describe("SERVICE - UpdateProfilePhoto", () => {
  const USER = createUser()
  const TEMP_FILE_NAME = 'FILENAME.ext'

  beforeEach(() => {
    fileService = createMockFromClass(FSFileService as any)
    userRepository = createMockFromClass(TypeormUserRepository as any)
    postRepository = createMockFromClass(TypeormPostRepository as any)
    followRepository = createMockFromClass(TypeormFollowRepository as any)

    service = new UpdateProfilePhotoService(userRepository, fileService, followRepository, postRepository)
  })

  describe("Successful cases", () => {
    beforeEach(() => {
      userRepository.findById.mockReturnValue(USER)
      userRepository.update.mockReturnValue(USER)
    })

    it("Must update all follow photos when user update the profile photo", async () => {
      await service.execute({ userID: USER.id, tempFilename: TEMP_FILE_NAME })

      expect(followRepository.updatePhotoFromAllFollowOfUserID).toHaveBeenCalledWith(USER.id, `${USER.id}_profile.ext`)
    })

    it("Must update all post photos when user update the profile photo", async () => {
      await service.execute({ userID: USER.id, tempFilename: TEMP_FILE_NAME })

      expect(postRepository.updatePhotoFromAllPostFromUserID).toHaveBeenCalledWith(USER.id, `${USER.id}_profile.ext`)
    })

    it("Must save file when user when user exists", async () => {
      await service.execute({ userID: USER.id, tempFilename: TEMP_FILE_NAME })

      expect(fileService.deleteFile).not.toHaveBeenCalled()
      expect(fileService.saveFile).toHaveBeenCalledWith(TEMP_FILE_NAME, `${USER.id}_profile.ext`)
    })

    it("Must update user photo_file", async () => {
      await service.execute({ userID: USER.id, tempFilename: TEMP_FILE_NAME })

      expect(userRepository.update).toHaveBeenCalledWith(USER.id, { photo_filename: `${USER.id}_profile.ext` })
    })

    it("Must delete existent user photo when user already have profile photo", async () => {
      const PHOTO_FILENAME = 'existent_user_profile_photo.jpg'
      userRepository.findById.mockReturnValueOnce({ ...USER, photo_filename: PHOTO_FILENAME })

      await service.execute({ userID: USER.id, tempFilename: TEMP_FILE_NAME })

      expect(fileService.deleteFile).toHaveBeenCalledWith(PHOTO_FILENAME)
    })
  })

  describe("Error cases", () => {
    beforeEach(() => {
      userRepository.findById.mockReturnValue(undefined)
    })

    it("Must not update user profile when user not exists", async () => {
      await expect(service.execute({ userID: USER.id, tempFilename: TEMP_FILE_NAME })).rejects.toBeInstanceOf(ApiRequestError)
    })
  })
})
