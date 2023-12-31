import { inject, injectable } from "tsyringe";
import { NextFunction, Request, Response } from "express"

import { Service } from "@api/dtos/service";
import { Follow } from "@domains/entities/follow";
import { CreateFollowDTO } from "@api/endpoints/follow/dtos/create-follow";
import { ResolveController } from "@infrastructures/decorators/resolve-controller";
import { CREATE_FOLLOW_SERVICE_CONTAINER } from "@infrastructures/constants/containers";

@injectable()
export class FollowController {
  constructor(
    @inject(CREATE_FOLLOW_SERVICE_CONTAINER)
    private readonly service: Service<CreateFollowDTO, Follow>
  ) {
  }

  @ResolveController(FollowController)
  async execute(req: Request, res: Response, next: NextFunction) {
    const { id } = req.user
    const { followee_id }: Pick<CreateFollowDTO, 'followee_id'> = req.body

    const follow = await this.service.execute({ followee_id, follower_id: id })

    res.locals.follow = follow
    res.status(201)

    next()
  }
}
