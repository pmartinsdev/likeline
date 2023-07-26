import { injectable } from "tsyringe";
import { MongoRepository } from "typeorm";

import { dataSource } from "../datasource";
import { UserEntity } from "../entities/user";

import { User } from "@domains/entities/user";
import { UserRepository } from "@infraestructures/repositories/user";
import { CreateUserDTO } from "@api/endpoints/user/dtos/create-user";

@injectable()
export class TypeormUserRepository implements UserRepository {
  private repository: MongoRepository<UserEntity>

  constructor() {
    this.repository = dataSource.getMongoRepository(UserEntity)
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

  async findByUsername(username: string): Promise<User | undefined> {
    const foundUserByUsername = await this.repository.findOneBy({
      username
    })

    return foundUserByUsername ?? undefined
  }
}
