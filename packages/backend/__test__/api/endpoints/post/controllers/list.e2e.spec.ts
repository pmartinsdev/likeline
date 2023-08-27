import fs from "fs"
import path from "path";
import { SuperTest, Test } from "supertest";

import { Post } from "@domains/entities/post";
import { User } from "@domains/entities/user";
import { GLOBAL_PREFIX } from "@infrastructures/constants/server";
import { getApiForTest } from "../../../../utils/get-api-for-test";
import { createAndAuthenticateUser } from '../../../../utils/authenticate-user';

let post: Post
let user: User
let token: string;
let api: SuperTest<Test>;

const BASE_URL = `${GLOBAL_PREFIX}/posts`;
let imageFile: fs.ReadStream

describe("CONTROLLER - listPost", () => {
  beforeAll(async () => {
    const imagePath = path.join(__dirname, '../../../../temp/image.test');
    imageFile = fs.createReadStream(imagePath)

    api = await getApiForTest();

    const authenticatedUser = await createAndAuthenticateUser(api);

    user = authenticatedUser.user;
    token = authenticatedUser.token;

    const { body } = await api.post(BASE_URL)
      .set("Authorization", `Bearer ${token}`)
      .field("title", 'Some random Post')
      .attach("image", imageFile);

    post = body
  });

  describe("Successful cases", () => {
    it("Must list a new post for a logged user", async () => {
      const { body, status } = await api.get(BASE_URL)
        .set("Authorization", `Bearer ${token}`)

      expect(status).toEqual(200);
      expect(body).toEqual(expect.arrayContaining([expect.objectContaining({
        ...post, owner: {
          username: user.username,
          photo_url: null
        }
      })]));
    });

    it("Must all posts have a valid user photo URL when post have some like", async () => {
      await api.post(`${GLOBAL_PREFIX}/likes/${post.id}`).set('Authorization', `Bearer ${token}`)

      const { body, status } = await api.get(BASE_URL)
        .set("Authorization", `Bearer ${token}`)

      expect(status).toEqual(200)
      expect(body.every((post: Post) => post.likes.every(like => like.user.photo_url?.includes('/api/images/') || like.user.photo_url === null))).toBeTruthy();
    })
  });
});