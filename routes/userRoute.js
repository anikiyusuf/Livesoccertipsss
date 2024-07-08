const express = require('express')
const { signup, login, requestPasswordReset, verifyOtp, changePassword } = require('../controller/userController')
const userRouter = express.Router()

userRouter.post('/sign' , signup)
userRouter.post('/login' , login)
userRouter.post('/request-password-reset',  requestPasswordReset);
userRouter.post('/verify-otp', verifyOtp);
userRouter.post('/change-password', changePassword);


module.exports = userRouter