import { User } from "@domains/entities/user"
import { createRandonString } from "./create_random_string"

export const createUser = (user_id?: User['id']) => {
  const randomString = createRandonString()

  const userId = user_id ?? `user_id_${randomString}`

  const user: User = {
    id: userId,
    password: '123',
    email: `doe_${randomString}@email.com`,
    username: `I_doe_${randomString}`,
    name: 'Jonh Doe',
  }

  return user
} 
