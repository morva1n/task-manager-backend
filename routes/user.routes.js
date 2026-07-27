import express from 'express'

const routes = express.Router();

import * as user from '../controllers/user.controllers.js'

import { validationMiddleware } from '../middlewares/validation.middlewares.js';
import { authSchema } from '../validation/auth.schema.js';

routes.post('/registration', validationMiddleware(authSchema), user.registrationUser)
routes.post('/login', validationMiddleware(authSchema), user.loginUser)
routes.post('/logout', user.logoutUser)
routes.post('/refresh', user.refreshUser)

export default routes;