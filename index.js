require('dotenv').config();
const express = require("express");
const userRouter = require('./routes/userRoute');
const { connectionMongoDB } = require("./db");
const cors = require('cors');
// const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 5000;




connectionMongoDB();

// Body Parser Middleware
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));

app.use(cors({
    origin: 'https://livesoccertipsss-qnq2.onrender.com', // Allow your frontend URL
    credentials: true // If you are sending cookies (e.g., JWT)
}));

// views 
app.set('view engine', 'ejs');

app.use("/", require("./routes/viewsRoutes"));
app.use('/auth', userRouter);

// Error handling middleware


app.listen(PORT, () => {
    console.log(`Server running on localhost:${PORT}`);
});