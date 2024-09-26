const mongoose = require("mongoose");
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resetPasswordOtp: { type:String},
    resetPasswordOtpExpires: { type: Date},
    createdAt: { type: Date, default: Date.now },
    lastUpdateAt: { type: Date, default: Date.now }
});

// Method to compare password for login
userSchema.methods.isValidPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;