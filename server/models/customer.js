const mongoose = require("mongoose");

const cart = new mongoose.Schema({
    numberOfItems: {
        type: Number,
        default: 0,
    },
    totalPrice: {
        type: Number,
        default: 0,
    },
    shopItemsRef: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "shop-item",
        }
    ],
});

const order = new mongoose.Schema({
    numberOfItems: {
        type: Number,
        default: 0,
    },
    totalPrice: {
        type: Number,
        default: 0,
    },
    items: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now(),
    },
})

const customer = new mongoose.Schema({
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
    gender: {
        type: String,
        required: true,
    },
    cart: {
        type: cart,
        default: {},
    },
    order: { 
        type: String,
        default: {},
     },
});

module.exports = mongoose.model("customer", customer);