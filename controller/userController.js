require('dotenv').config();
const UserModel = require("../models/userModel");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const nodemailer = require('nodemailer');
const JWT_TOKEN = process.env.JWT_TOKEN;

// Function to create a token
const createToken = (id) => {
    return jwt.sign({ id }, JWT_TOKEN, { expiresIn: '1h' });
};

// Signup function
const signup = async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirm_password } = req.body;

        if (!firstName || !lastName || !email || !password || !confirm_password) {
            console.log('Missing required fields');
            return res.status(400).send({ message: "All fields are required" });
        }

        // Check if passwords match
        if (password !== confirm_password) {
            return res.status(400).send({ message: "Passwords do not match" });
        }

        // Check if user already exists
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400)
            .render('exist')
            // .send({ message: "User already exists" });
        }

        // Hash the password before saving to DB
       
        const saltRounds = 10; // Consider reducing to 8 if necessary
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user and save to DB
        const user = new UserModel({ firstName, lastName, email, password: hashedPassword });
        await user.save();

        // Create JWT token
        const token = createToken(user._id);

        // Send token as a cookie and a success message
        res.status(200)
            .cookie('jwt', token, { maxAge: 3600000, httpOnly: true }) 
            .render('pay');
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).send({ message: "Email is already in use" });
        }
        res.status(500).send({ message: 'Internal server error', error: err.message });
    }
}

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


const logOut = (req, res) => {
    res.status(200)
        .clearCookie('jwt', { httpOnly: true })
        .send({ message: 'Successfully logged out' });
}

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(400).send({ message: 'User not found' });
        }

        // Generate a random 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000);

        // Set OTP and expiration time (10 minutes)
        user.resetPasswordOtp = otp;  // Correctly assign the OTP to user
        user.resetPasswordOtpExpires = Date.now() + 10 * 60 * 1000; // Current time + 10 minutes
        await user.save();
          
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

        // Simulate sending OTP to user's email (log for now)
        // console.log(`Password reset OTP (email to be sent): ${otp}`);

        res.status(200)
        .render('resetpassword')
        // send({ message: "OTP sent to your email" });
    } catch (err) {
        console.error('Error in forgot password:', err);
        res.status(500).send({ message: 'Internal server error', error: err.message });
    }
};

const resetPasswordWithOtp = async (req, res) => {
    try {
        // console.log(req.body);
        const { email, otp, password, confirm_password } = req.body;

        if (!email || !otp || !password || !confirm_password) {
            console.log('Missing required fields');
            return res.status(400).send({ message: "All fields are required" });
        }

        // Check if passwords match
        if (password !== confirm_password) {
            return res.status(400).send({ message: 'Passwords do not match' });
        }

        // Find user by email, OTP, and ensure OTP is not expired
        const user = await UserModel.findOne({
            email,
            resetPasswordOtp: otp, // Correct field name
            resetPasswordOtpExpires: { $gt: Date.now() } // Ensure OTP hasn't expired
        });

        if (!user) {
            return res.status(400).send({ message: 'Invalid or expired OTP' });
        }

        // Hash the new password
        const saltRounds = 10; // You can adjust this value based on performance needs
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update user's password and clear OTP fields
        user.password = hashedPassword;
        user.resetPasswordOtp = undefined; // Correct 'underfined' to 'undefined'
        user.resetPasswordOtpExpires = undefined;

        await user.save();
        // res.status(200).render('success')
          res.status(200).send({ message: 'Password reset successful, you can now log in with your new password' });
    } catch (err) {
        console.log('Error in resetting password with OTP:', err);
        res.status(500).send({ message: 'Internal server error', error: err.message });
    }
};



module.exports = { signup, login, logOut, resetPasswordWithOtp, forgotPassword};






