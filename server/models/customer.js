const mongoose = require("mongoose");

const cart = new mongoose.model({
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

const order = new mongoose.model({
    numberOfItems: {
        type: Number,
        default: 0,
    },
    totalPrice: {
        type: Number,
        default: 0,
    },
    date: {
        type: Date,
        default: Date.now(),
    },
    shopItemsRef: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "shop-item",
        }
    ],
})

const customer = new mongoose.model({
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
    },
    order: [
        {
        type: order,
        }   
    ],
});

module.exports = mongoose.model("customer", customer);