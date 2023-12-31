import { container } from "tsyringe"
import { AUTHENTICATION_SERVICE_CONTAINER } from "@infrastructures/constants/containers"
import { AuthenticateService } from "@api/endpoints/auth/services/authenticate"

container.registerSingleton(AUTHENTICATION_SERVICE_CONTAINER, AuthenticateService)
