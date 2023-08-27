import fs from 'fs'
import path from "path";
import { SuperTest, Test } from "supertest";

import { GLOBAL_PREFIX } from "@infrastructures/constants/server";
import { getApiForTest } from "../../../../utils/get-api-for-test";
import { createAndAuthenticateUser } from "../../../../utils/authenticate-user";

let token: string;
let api: SuperTest<Test>;

const BASE_URL = `${GLOBAL_PREFIX}/posts`;

describe("CONTROLLER - DeletePost", () => {
  beforeAll(async () => {
    api = await getApiForTest();

    const authentication = await createAndAuthenticateUser(api);
    token = authentication.token;
  });

  describe("Successful cases", () => {
    it("Must delete the authenticated user's post", async () => {
      const imagePath = path.join(__dirname, '../../../../temp/image.test');
      const imageFile = fs.createReadStream(imagePath)

      const { body } = await api.post(`${BASE_URL}`)
        .field('title', "some title")
        .attach("image", imageFile)
        .set({
          Authorization: `Bearer ${token}`,
        });

      const { status } = await api.delete(`${BASE_URL}/${body.id}`).set({
        Authorization: `Bearer ${token}`,
      });

      expect(status).toEqual(204);
    });
  });

  describe("Error cases", () => {
    it("Must not delete a non-existent post", async () => {
      const { status, body } = await api.delete(`${BASE_URL}/non-existent-post-id`).set({
        Authorization: `Bearer ${token}`,
      });

      expect(body).toMatchObject({
        message: 'Post not exist',
        status: 404,
      });
      expect(status).toEqual(404);
    });

    it("Must not delete a post if not owned by the user", async () => {
      const otherUserAuthentication = await createAndAuthenticateUser(api)

      const imagePath = path.join(__dirname, '../../../../temp/image.test');
      const imageFile = fs.createReadStream(imagePath)

      const { body: postOfOtherUser } = await api.post(`${BASE_URL}`)
        .field('title', "some title")
        .attach("image", imageFile)
        .set({
          Authorization: `Bearer ${otherUserAuthentication.token}`,
        });

      const { status, body } = await api.delete(`${BASE_URL}/${postOfOtherUser.id}`).set({
        Authorization: `Bearer ${token}`,
      });

      expect(body).toMatchObject({
        message: 'You can only delete posts that you own',
        status: 403,
      });
      expect(status).toEqual(403);
    });
  });
});