const express = require('express')
const { signup, login, resetPasswordWithOtp,  forgotPassword} = require('../controller/userController')
const userRouter = express.Router()

userRouter.post('/signup' , signup)
userRouter.post('/login' , login)
userRouter.post('/forgot-password',  forgotPassword);
userRouter.post('/reset-password', resetPasswordWithOtp);


module.exports = userRouter