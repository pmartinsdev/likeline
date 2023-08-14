import { injectable } from "tsyringe";
import { MongoRepository, ObjectId, Repository } from "typeorm";

import { dataSource, isTestEnvironment } from "../datasource";
import { IdType, UserEntity } from "../entities/user";

import { User } from "@domains/entities/user";
import { UserRepository } from "@infrastructures/repositories/user";
import { CreateUserDTO } from "@api/endpoints/user/dtos/create-user";

@injectable()
export class TypeormUserRepository implements UserRepository {
  private repository: MongoRepository<UserEntity> | Repository<UserEntity>

  constructor() {
    const methodBasedOnEnvironment = isTestEnvironment ? 'getRepository' : 'getMongoRepository'

    this.repository = dataSource[methodBasedOnEnvironment](UserEntity)
  }

  async create(payload: Omit<CreateUserDTO, 'confirmPassword'>): Promise<User> {
    const createdUser = this.repository.create(payload);

    await this.repository.save(createdUser)

    return createdUser
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const foundUserByEmail = await this.repository.findOneBy({
      email
    })

    return foundUserByEmail ?? undefined
  }

  async findById(objectId: IdType): Promise<User | undefined> {
    const foundUserById = await this.repository.findOneBy({
      id: (objectId as ObjectId).id as unknown as ObjectId
    })

    return foundUserById ?? undefined
  }

  async findByUsername(username: string): Promise<User | undefined> {
    const foundUserByUsername = await this.repository.findOneBy({
      username
    })

    return foundUserByUsername ?? undefined
  }

  async deleteById(objectId: IdType): Promise<void> {
    await this.repository.delete(objectId)
  }

  async update(userID: IdType, payload: Partial<User>): Promise<User> {
    await this.repository.update(userID, payload)

    const updatedUser = await this.findById(userID)

    return updatedUser!
  }
}