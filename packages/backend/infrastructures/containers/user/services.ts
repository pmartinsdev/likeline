import { container } from 'tsyringe'

import { User } from '@domains/entities/user'
import { Service } from '@api/endpoints/user/dtos/service'
import { CreateUserDTO } from '@api/endpoints/user/dtos/create-user'
import { CreateUserService } from '@api/endpoints/user/services/create'
import { CREATE_USER_SERVICE_CONTAINER, DELETE_USER_SERVICE_CONTAINER, PROFILE_SERVICE_CONTAINER } from '@api/constants/containers'

import { ProfileDTO } from '@api/endpoints/user/dtos/profile'
import { IdType } from '@infrastructures/typeorm/entities/user'
import { ProfileService } from '@api/endpoints/user/services/profile'
import { DeleteUserService } from '@api/endpoints/user/services/delete'

container.registerSingleton<Service<IdType, ProfileDTO>>(PROFILE_SERVICE_CONTAINER, ProfileService)
container.registerSingleton<Service<IdType, void>>(DELETE_USER_SERVICE_CONTAINER, DeleteUserService)
container.registerSingleton<Service<CreateUserDTO, User>>(CREATE_USER_SERVICE_CONTAINER, CreateUserService)
