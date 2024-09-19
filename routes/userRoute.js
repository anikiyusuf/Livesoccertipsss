const express = require('express')
const { signup, login, requestPasswordReset,  changePassword } = require('../controller/userController')
const userRouter = express.Router()

userRouter.post('/signup' , signup)
userRouter.post('/login' , login)
userRouter.post('/request-password-reset',  requestPasswordReset);
// userRouter.post('/verify-otp', verifyOtp);
userRouter.post('/change-password', changePassword);


module.exports = userRouter