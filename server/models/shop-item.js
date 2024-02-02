const mongoose = require("mongoose");

const shopItem = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        maxLength: 50,
    },
    image: {
        data: Buffer,
        type: String,
    },
    price: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        minLength: 50,
    },
    availableCount: {
        type: Number,
        required: true,
    },
    genre: {
        type: [ String ],
    }
});

module.exports = mongoose.model("shop-item", shopItem);