const express = require("express")
 const  {
    homePage,
    Sign,
    Pay,
    Game,
    Login,
    About,
    Contact, 
    error,
    
} = require("../controller/viewsController")
const viewRouter = express.Router()

viewRouter.get("/index" , homePage)
viewRouter.get("/sign" , Sign)
viewRouter.get("/payment" , Pay)
viewRouter.get("/games" , Game) 
viewRouter.get("/login" , Login)
viewRouter.get("/about" , About) 
viewRouter.get("/contact" , Contact) 
viewRouter.get("/error", error )



module.exports = viewRouter