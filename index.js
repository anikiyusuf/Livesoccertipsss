require('dotenv').config();
const express = require("express");
const userRouter = require('./routes/userRoute');
const { connectionMongoDB } = require("./db");
const app = express();
const PORT = process.env.PORT || 5000;

connectionMongoDB();

// Body Parser Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));

// views 
app.set('view engine', 'ejs');

app.use("/index", require("./routes/viewsRoutes"));
app.use('/auth', userRouter);

// Error handling middleware


app.listen(PORT, () => {
    console.log(`Server running on localhost:${PORT}`);
});