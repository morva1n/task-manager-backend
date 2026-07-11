import express from 'express'

const routes = express.Router();

import * as user from '../controllers/user.controllers.js'

routes.post('/registration', user.registrationUser)
routes.all('/login', user.loginUser)

export default routes;