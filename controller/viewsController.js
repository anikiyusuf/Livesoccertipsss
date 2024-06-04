const homePage = async (req,res) => {
    res.render('index')
}
const About = async (req,res) => {
    res.render('about')
}
const Contact = async (req,res) => {
    res.render('contact')
}
const Login = async (req,res) => {
    res.render('login')
}
const Game = async (req,res) => {
    res.render('games')
}
const Pay = async (req,res) => {
    res.render('payment')
}
const Sign = async (req,res) => {
    res.render('Sign')
}


const error = async (req,res) =>{
    res.render('error')
}

module.exports = {
    homePage,
    Sign,
    Pay,
    Game,
    Login,
    About,
    Contact,
    error,
}