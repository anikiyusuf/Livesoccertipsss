
require('dotenv').config();
const UserModel = require("../models/userModel");
const jwt = require('jsonwebtoken');
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const nodemailer = require('nodemailer');

const JWT_TOKEN = process.env.JWT_TOKEN;

// Function to create a token
const createToken = (id) => {
    return jwt.sign({ id }, JWT_TOKEN, { expiresIn: '1h' });
};

const signup = async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirm_password } = req.body;

        if (password !== confirm_password) {
            return res.status(400).send({ message: "Passwords do not match" });
        }

        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).send({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new UserModel({ firstName, lastName, email, password: hashedPassword });
        await user.save();

        const token = createToken(user._id);

        res.status(200)
            .cookie('jwt', token, { maxAge: 3600000, httpOnly: true })
            .render('payment');

    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Internal server error", error: err.message });
    }
};


const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await UserModel.findOne({ email });

        if (!user) {
            console.log('Login failed: User not found');
            return res.status(400).send({ message: 'User not found' });
        }

        const isPasswordValid = await user.isValidPassword(password);
        if (!isPasswordValid) {
            console.log('Login failed: Wrong password');
            return res.status(400).send({ message: 'Wrong password' });
        }

        console.log('Login successful for user:', user.email);
        
        const token = createToken(user._id);
        res.status(200)
            .cookie('jwt', token, { maxAge: 3600000, httpOnly: true })
            .send({ message: 'Login successful' });

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



// const resetPassword = async (req, res) => {

//     try {
//         const { email, otp } = req.body;
//         const user = await UserModel.findOne({ email });

//         if (!user) {
//             return res.status(400).send({ message: "User not found" });
//         }

//         const currentDate = Date.now();
        
//         // Verify OTP and expiration time
//         if (user.resetPasswordToken !== otp || user.resetPasswordExpires < currentDate) {
//             return res.status(400).send({ message: "Invalid or expired OTP" });
//         }

//         res.status(200).send({ message: "OTP verified" });


//         const salt = await bcrypt.genSalt(10);  // Generate a salt for hashing

//         user.password = await bcrypt.hash(password, salt);  // Hash the new password with the salt
//         user.resetPasswordToken = undefined;
//         user.resetPasswordExpire = undefined;

//         // Use validateModifiedOnly to avoid validation error on unmodified fields
      

//     } catch (err) {
//         console.error(err);
//         res.status(500).send({ message: "Internal server error", error: err.message });
//     }
    
// };


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
        user.resetPasswordToken = undefined;  // Clear the reset token
        user.resetPasswordExpire = undefined; // Clear the expiration date
        await user.save({ validateBeforeSave: false }); // Save the updated user document

        res.status(200).send({ message: "Password changed successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Internal server error", error: err.message });
    }
};
// const changePassword = async (req, res) => {
//     try {
//         const { email, newPassword, confirmNewPassword } = req.body;

//         if (newPassword !== confirmNewPassword) {
//             return res.status(400).send({ message: "Passwords do not match" });
//         }

//         const user = await UserModel.findOne({ email });

//         if (!user) {
//             return res.status(400).send({ message: "User not found" });
//         }

//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(newPassword, salt);

//         user.password = hashedPassword;
//         user.resetPasswordToken = undefined;  // Clear the reset token
//         user.resetPasswordExpire = undefined; // Clear the expiration date
//         await user.save({ validateBeforeSave: false }); // No need to skip validation here

//         res.status(200).send({ message: "Password changed successfully" });

//     } catch (err) {
//         console.error(err);
//         res.status(500).send({ message: "Internal server error", error: err.message });
//     }
// };
// const forgetPassword = async (req, res) => {
//     try {
//         const { email } = req.body;

//         const user = await UserModel.findOne({ email });
//         if (!user) {
//             return res.status(400).send({ message: "User not found" });
//         }

//         const resetToken = crypto.randomBytes(32).toString('hex');
//         const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
//         const resetPasswordExpire = new Date(Date.now() + 3600000); // Expires in 1 hour

//         user.resetPasswordToken = resetPasswordToken;
//         user.resetPasswordExpire = resetPasswordExpire;

//         await user.save({ validateModifiedOnly: true });

//         const resetUrl = `https://livesoccertipsss-qnq2.onrender.com/resetpassword?token=${resetToken}&id=${user.id}`;
//         const mailOptions = {
//             to: user.email,
//             from: 'livesoccertip@gmail.com',
//             subject: "Password Reset",
//             text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
//                     Please click on the following link, or paste this into your browser to complete the process:\n\n
//                     ${resetUrl}\n\n
//                     If you did not request this, please ignore this email and your password will remain unchanged.\n`,
//         };

//         await transporter.sendMail(mailOptions);

//         res.status(200).
//         render('passwordsent');

//     } catch (err) {
//         console.log(err);
//         res.status(500).send({ message: 'Internal server error', error: err });
//     }
// };



// const resetPassword = async (req, res) => {
//     try {
//         const { resetToken } = req.params;
//         const { password, confirm_password } = req.body;

//         const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
//         const user = await UserModel.findOne({
//             resetPasswordToken: hashedToken,
//             resetPasswordExpire: { $gt: Date.now() },
//         });

//         if (!user) {
//             return res.status(400).send({ message: "Invalid or expired token" });
//         }

//         if (password !== confirm_password) {
//             return res.status(400).send({ message: 'Passwords do not match' });
//         }


//         const salt = await bcrypt.genSalt(10);  // Generate a salt for hashing
  
//         user.password = await bcrypt.hash(password, salt);  // Hash the new password with the salt
//         user.resetPasswordToken = undefined;
//         user.resetPasswordExpire = undefined;

//         // Use validateModifiedOnly to avoid validation error on unmodified fields
//         await user.save({ validateModifiedOnly: true });

//         const token = createToken(user._id);

//         res.status(200)
//             .cookie('jwt', token, { maxAge: 3600000, httpOnly: true })
//             .render('successful');
//     } catch (err) {
//         console.log(err);
//         res.status(500).send({ message: "Internal server error", error: err });
//     }
// };

module.exports = { signup, login, logOut, requestPasswordReset, changePassword};






