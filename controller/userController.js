require('dotenv').config();
const UserModel = require("../models/userModel");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");

const JWT_TOKEN = process.env.JWT_TOKEN;

// Function to create a token
const createToken = (id) => {
    return jwt.sign({ id }, JWT_TOKEN, { expiresIn: '1h' });
};

// Signup function
const signup = async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirm_password } = req.body;

        // Check if passwords match
        if (password !== confirm_password) {
            return res.status(400).send({ message: "Passwords do not match" });
        }

        // Check if user already exists
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).render("existing");
        }

        // Hash the password before saving to DB
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user and save to DB
        const user = new UserModel({ firstName, lastName, email, password: hashedPassword });
        await user.save();

        // Create JWT token
        const token = createToken(user._id);

        // Send token as a cookie
        res.status(200)
            .cookie('jwt', token, { maxAge: 3600000, httpOnly: true })
            .render('payment');

    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Internal server error", error: err.message });
    }
};

// Login function
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await UserModel.findOne({ email });

        if (!user) {
            console.log('Login failed: User not found');
            return res.status(400).send({ message: 'User not found' });
        }

        // Compare the entered password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).render('wrong');
        }

      

        // Create a token for the logged-in user
        const token = createToken(user._id);

        // Send token as a cookie and respond with success message
        res.status(200)
            .cookie('jwt', token, { maxAge: 3600000, httpOnly: true })
            .render('games');

    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Internal server error', error: err.message });
    }
};

module.exports = { signup, login };

const logOut = (req, res) => {
    res.status(200)
        .clearCookie('jwt', { httpOnly: true })
        .send({ message: 'Successfully logged out' });
}


const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(400).send({ message: "User not found" });
        }

        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpiration = Date.now() + 3600000; // OTP expires in 1 hour

        user.resetPasswordToken = otp;
        user.resetPasswordExpire = otpExpiration;
        await user.save({ validateBeforeSave: false });

        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: "aniki99@gmail.com",
            to: user.email,
            subject: "Password Reset OTP",
            text: `Your OTP for password reset is ${otp}`
        };

        await transporter.sendMail(mailOptions);


        res.status(200).send({ message: "OTP sent to your email" });

  
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Internal server error", error: err.message });
    }
};

const changePassword = async (req, res) => {
    try {
        const { email, newPassword, confirmNewPassword } = req.body;

        if (newPassword !== confirmNewPassword) {
            return res.status(400).send({ message: "Passwords do not match" });
        }

        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(400).send({ message: "User not found" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;  
        user.resetPasswordExpire = undefined; 
        await user.save({ validateBeforeSave: false }); 

        res.status(200).send({ message: "Password changed successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Internal server error", error: err.message });
    }
};

module.exports = { signup, login, logOut, requestPasswordReset, changePassword};






