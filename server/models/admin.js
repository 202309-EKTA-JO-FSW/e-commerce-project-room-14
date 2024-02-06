const mongoose = require("mongoose");

const admin = new mongoose.model({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    hashedPassword: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model("admin", admin);