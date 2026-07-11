import express from 'express'

const routes = express.Router();

import * as user from '../controllers/user.controllers.js'

routes.post('/registration', user.registrationUser)
routes.post('/login', user.loginUser)

export default routes;