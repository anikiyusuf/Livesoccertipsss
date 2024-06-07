const express = require("express")
 const  {
    homePage,
    Sign,
    Pay,
    Game,
    Login,
    About,
    Contact, 
    ForgetPassword,
    ResetPassword,
    PasswordSent,
    error,
    
} = require("../controller/viewsController")
const viewRouter = express.Router()

viewRouter.get("/", homePage)
viewRouter.get("/sign", Sign)
viewRouter.get("/payment", Pay)
viewRouter.get("/games", Game) 
viewRouter.get("/login", Login)
viewRouter.get("/about", About) 
viewRouter.get("/contact", Contact) 
viewRouter.get("/forgetpassword", ForgetPassword)
viewRouter.get("/resetpassword", ResetPassword)
viewRouter.get("/passwordsent", PasswordSent)
viewRouter.get("/error", error )



module.exports = viewRouter