const express = require('express')
const { signup, login, forgetPassword,resetPassword } = require('../controller/userController')
const userRouter = express.Router()

userRouter.post('/sign' , signup)
userRouter.post('/login' , login)
userRouter.post("/forgotpassword", forgetPassword)
userRouter.patch("/resetpassword/:resetToken", resetPassword)




module.exports = userRouter