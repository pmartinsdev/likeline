import { SuperTest, Test } from "supertest"

import { Comment } from "@domains/entities/comment"
import { GLOBAL_PREFIX } from "@infrastructures/constants/server"
import { getApiForTest } from "../../../../utils/get-api-for-test"
import { ReplyCommentDTO } from "@api/endpoints/reply/dtos/comment"
import { authenticateUser } from "../../../../utils/authenticate-user"
import { getImageFile } from "../../../../utils/get-image-file"
import { User } from "@domains/entities/user"

let user: User
let token: string
let comment: Comment
let api: SuperTest<Test>
let baseURL = `${GLOBAL_PREFIX}/reply/comment`

describe("CONTROLLER - ReplyComment", () => {
  let PAYLOAD: Omit<ReplyCommentDTO, 'user_id'>

  beforeAll(async () => {
    api = await getApiForTest()

    const authenticatedResponse = await authenticateUser(api)

    user = authenticatedResponse.user
    token = authenticatedResponse.token

    const { body: post } = await api.post(`${GLOBAL_PREFIX}/posts`).field('title', "some post title").attach('image', getImageFile()).set('Authorization', `Bearer ${token}`)

    const { body } = await api.post(`${GLOBAL_PREFIX}/comments`).send({
      post_id: post.id,
      comment: 'Post comment'
    }).set('Authorization', `Bearer ${token}`)

    comment = body

    PAYLOAD = {
      comment_id: comment.id,
      comment: 'Reply comment'
    }
  })

  describe("Successful cases", () => {
    it("Must reply an existent comment", async () => {
      const { body, status } = await api.post(baseURL).send(PAYLOAD).set('Authorization', `Bearer ${token}`)

      expect(body).toEqual(expect.objectContaining({
        comment: PAYLOAD.comment,
        comment_id: comment.id,
        user: expect.objectContaining({
          id: user.id,
          username: user.username,
        })
      }))
      expect(body).toHaveProperty('id')
      expect(status).toEqual(201)
    })
  })

  describe("Error cases", () => {
    it("Must not reply a non-existent comment", async () => {
      const { body, status } = await api.post(baseURL).send({
        ...PAYLOAD,
        comment_id: 'non-existent-comment-id'
      }).set('Authorization', `Bearer ${token}`)

      expect(body).toEqual(expect.objectContaining({
        message: 'Comment not exists',
        status: 404
      }))
      expect(status).toEqual(404)
    })

    it("Must not reply if user not exists", async () => {
      const otherAuthenticatedUser = await authenticateUser(api)

      await api.delete(`${GLOBAL_PREFIX}/users`).set('Authorization', `Bearer ${otherAuthenticatedUser.token}`)

      const { body, status } = await api.post(baseURL).send(PAYLOAD).set('Authorization', `Bearer ${otherAuthenticatedUser.token}`)

      expect(body).toEqual(expect.objectContaining({
        message: 'User not exists',
        status: 404
      }))
      expect(status).toEqual(404)
    })

    it('Must not reply a non authenticated user', async () => {
      const { body, status } = await api.post(baseURL).send(PAYLOAD)

      expect(body).toEqual(expect.objectContaining({
        message: 'Token is missing',
        status: 401
      }))
      expect(status).toEqual(401)
    })

    it('Must not reply a user with wrong Authorization token', async () => {
      const { body, status } = await api.post(baseURL).send(PAYLOAD).set("Authorization", 'WHRONG TOKEN')

      expect(body).toEqual(expect.objectContaining({
        message: 'Invalid Token',
        status: 401
      }))
      expect(status).toEqual(401)
    })
  })

  describe("Data treatment", () => {
    it("Must replied comment user data have a valid photo_url at request response", async () => {
      await api.put(`${GLOBAL_PREFIX}/users/profile-photo`).attach('photo', getImageFile()).set('Authorization', `Bearer ${token}`)

      const { body } = await api.post(baseURL).send(PAYLOAD).set('Authorization', `Bearer ${token}`)

      expect(body.user).toHaveProperty('photo_url')
      expect(body.user).not.toHaveProperty('photo_filename')
      expect(body.user.photo_url).toEqual(expect.stringContaining('http'))
      expect(body.user.photo_url).toEqual(expect.stringContaining(`${GLOBAL_PREFIX}/images`))
    })

    it("Must replied comment user data not have user password", async () => {
      const { body } = await api.post(baseURL).send(PAYLOAD).set('Authorization', `Bearer ${token}`)

      expect(body.user).not.toHaveProperty('password')
    })
  })
})