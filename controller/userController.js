require('dotenv').config()
const UserModel = require("../models/userModel")
const jwt = require('jsonwebtoken')
// const TokenModel = require("../models/viewModel")
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const nodemailer = require('nodemailer');




// const bcryptSalt = process.env.BCRYPT_SALT;
const JWT_TOKEN = process.env.JWT_TOKEN




// this function is used to create token 
const createToken = (id) => {
    return jwt.sign({ id } , JWT_TOKEN , { expiresIn : '1h', })
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

        const user = new UserModel({ firstName, lastName, email, password });
        await user.save();

        const token = createToken(user._id);

        res.status(200)
            .cookie('jwt', token, { maxAge: 3600000, httpOnly: true })
            // .json({ user: user.toJSON(), token });
            .render('payment')
            //.json(user)

    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Internal server error", error: err.message });
    }
};

const login = async (req, res ) => {
    try{
            const { email , password } = req.body
            const user = await UserModel.findOne({ email: email})
   
            if(!user) {
                return res.status(400).send({ message : 'User not found'})
            }
            const validate = await bcrypt.compare(password, user.password)
            if(!validate) {
                return res.status(400).send({ message: 'Wrong password'});
            }
            const token = createToken(user._id)
            res.status(200)
             .cookie('jwt' , token, { maxAge: 3600000, httpOnly:true})
             .render('games')
            // res.json(user)
}catch( err){
    res.status(500)
    res.json(err)
}
}

const logOut = (req, res) => {
    res.status(200)
    .clearCookie('jwt', {httpOnly:true})
    .send({message:'Successfully logged out'});
}

const transporter = nodemailer.createTransport({
    service:'Gmail',
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS
    },
});

const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(400).send({ message: "User not found" });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const resetPasswordExpire = new Date(Date.now() + 3600000); // Expires in 1 hour

        user.resetPasswordToken = resetPasswordToken;
        user.resetPasswordExpire = resetPasswordExpire;

        await user.save({ validateModifiedOnly: true });

        const resetUrl = `https://livesoccertipsss-qnq2.onrender.com/auth/resetpassword?token=${resetToken}&id=${user.id}`;
        const mailOptions = {
            to: user.email,
            from: 'livesoccertip@gmail.com',
            subject: "Password Reset",
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
                    Please click on the following link, or paste this into your browser to complete the process:\n\n
                    ${resetUrl}\n\n
                    If you did not request this, please ignore this email and your password will remain unchanged.\n`,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).send({ message: 'Password reset link sent to email' });
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: 'Internal server error', error: err });
    }
};


const resetPassword = async (req, res) => {
    try {
        const { resetToken } = req.params;
        const { password, confirm_password } = req.body;

        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const user = await UserModel.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).send({ message: "Invalid or expired token" });
        }

        if (password !== confirm_password) {
            return res.status(400).send({ message: 'Passwords do not match' });
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        
        // Use validateModifiedOnly to avoid validation error on unmodified fields
        await user.save({ validateModifiedOnly: true });
        
        const token = createToken(user._id);

        res.status(200)
            .cookie('jwt', token, { maxAge: 3600000, httpOnly: true })
            .send({ message: "Password reset successful" });
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: "Internal server error", error: err });
    }
};



module.exports = { signup, login, logOut, resetPassword, forgetPassword}