const express = require('express')
const { signup, login, forgetPassword,resetPassword } = require('../controller/userController')
const userRouter = express.Router()

userRouter.post('/sign' , signup)
userRouter.post('/login' , login)
userRouter.post("/forgetpassword", forgetPassword)
userRouter.patch("/resetpassword", resetPassword)




module.exports = userRouter