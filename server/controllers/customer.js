const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const passwordValidator = require('password-validator');

const secretKey = process.env.ACCESS_TOKEN_SECRET;

const customerModel = require("../models/customer");
const shopItemModel = require("../models/shop-item");
const blackListedTokensModel = require("../models/blackListedTokens");

const customerController = {};
/*****************************validate password*********************************/
const validateCriteria = new passwordValidator();
validateCriteria
.is().min(8)
.is().max(70)
.has().uppercase()
.has().lowercase()
.has().digits(2)
.has().not().spaces()
/********************************************************************************/

//router.post('/signup', customerController.signup);
customerController.signup = async (req, res) => {
    try{
        const { username, email, password1, password2, gender } = req.body;

        const exists = await customerModel.findOne({ email: email}, {});
        if(exists){
            return res.status(400).json({message: "Email Already Used"});
        }
        else if( password1 !== password2){
            return res.status(400).json({message: "Passwords Do Not Match"})
        }
        else if(!(validateCriteria.validate(password1))){
            return res.status(400).json({message: "password does not follow the requied criteria"})
        }

        const hashedPassword = await bcrypt.hash(password1, 10);

        await customerModel.create({
            name: username,
            email,
            hashedPassword,
            gender,
        });

        const customer = await customerModel.findOne({ email: email }, {});

        const content = {
            id: customer._id,
            isAdmin: false,
        };
        const accessToken = jwt.sign(content, secretKey, {expiresIn: "1h"});
        res.json({accessToken: accessToken});
        res.redirect("/customer/");
    }
    catch (err){
        res.status(400).json(err.message);
    }
}

//router.post("/signin", customerController.signin);
customerController.signin = async (req, res) => {
    try{
        const { email, password, rememberMe } = req.body;
        const customer = await customerModel.findOne({email: email}, {});

        if(!customer){
            return res.status(400).json({message: "email or password incorrect"});
        }
        const hashedPassword = await bcrypt.compare(password, customer.hashedPassword);

        if(!hashedPassword){
            res.status(400).json({message: "email or password incorrect"})
        }

        const content = {
            id: customer._id,
            isAdmin: false,
        };
        const accessToken = jwt.sign(content, secretKey, {expiresIn: "1h"});
        res.json({accessToken: accessToken});
        res.redirect("/customer/");
        
    }
    catch (err){
        res.status(400).json(err.message);
    }
}

//router.post("/signout", customerController.signout);
customerController.signout = async (req, res) => {
    const token = await req.headers['authorization']?.split(' ')[1];
    await blackListedTokensModel.create({ token: token });
    res.status(200).json({ message: "you signed out successfully" });
}

// router.get("/", customerController.getAllShopItems);
customerController.getAllShopItems = async (req, res) => {
    try{
        const shopItems = await shopItemModel.find({});
        res.status(200).json(shopItems);
    }
    catch (err) {
        res.status(422).json(err);
    }
}

// router.get("/customer/filter", customerController.filterItems);
customerController.filterItems = async (req, res) => {
    try{
        const { category, minPrice, maxPrice, price } = req.query;
        const filterCriteria = {};

        if(category) {
            filterCriteria.genre = category;
        }

        if(minPrice && maxPrice){
            filterCriteria.price = { $gte: minPrice, $lte: maxPrice };
        }
        else if(price) {
            filterCriteria.price = price;
        }

        const filterdItems = await shopItemModel.find(filterCriteria);
        res.status(200).json(filterdItems);
    }
    catch(err) {
        res.status(422).json(err);
    }
}

// router.get("/customer/search", customerController.searchItems);
customerController.searchItems = async (req, res) => {
    try {
        const { query } = req.query;
        const searchResults = await shopItemModel.find({
            title: { $regex: query, $options: 'i' }
        });
        res.status(200).json(searchResults);
    }
    catch (err) {
        res.status(422).json(err);
    }
}

// router.post("/:id/cart", customerController.addToCart);
customerController.addToCart = async (req, res) => {
    try{
        const {id } = req.params;
        const { itemId, quantity } = req.body;

        const customer = await customerModel.findById(id);
        const shopItem = await shopItemModel.findById(itemId);

        if(!customer){
            return res.status(404).json({message: "customer not found"})
        }

        if(!shopItem){
            return res.status(404).json({message: "item not found"})
        }

        if( shopItem.availableCount === 0){
            return res.status(422).json({message: "item unavailable (quantity = 0)"});
        }

        if(quantity > shopItem.availableCount){
            return res.status(422).json({message: `quantity overflows the available items  (available = ${shopItem.availableCount})`});
        }

        shopItem.availableCount -= quantity;

        customer.cart.shopItemsRef.push(itemId);
        customer.cart.numberOfItems += quantity;
        customer.cart.totalPrice += shopItem.price * quantity;

        await customer.save();
        await shopItem.save();

        res.status(200).json(customer.cart);
    }
    catch (err) {
        res.status.json(err)
    }
}

// router.post("/:id/checkout", customerController.orderAndCheckout);
customerController.orderAndCheckout = async (req, res) => {
    try{
        const { id } = req.params;

        const customer = await customerModel.findById(id);
        if(!customer){
            return res.status(404).json({message: "customer not found"});
        }

        const items = customer.cart.shopItemsRef;
        const orderItems = await shopItemModel.find({ _id: { $in: items } }, { title: 1, _id: 0 });
        const mappedItems = orderItems.map(item => item.title);
        const cartItems = mappedItems.join(', ');
        const totalPrice = customer.cart.totalPrice;

        const updatedOrder = {
            numberOfItems: customer.cart.numberOfItems,
            totalPrice,
            items: cartItems,
        }

        customer.order = updatedOrder;

        customer.cart.shopItemsRef = [];
        customer.cart.numberOfItems = 0;
        customer.cart.totalPrice = 0;
        
        await customer.save();

        res.status(200).json({ cartItems, totalPrice });
    }
    catch (err) {
        res.status(422).json(err);
    }
}

// router.get("/:id", customerController.getOneItem);
customerController.getOneItem = async (req, res) => {
    try{
        const { id } = req.params;

        const item = await shopItemModel.findById(id);

        if(!item){
            return res.status(404).json({message: "Item not found"});
        }

        res.status(200).json(item);
    }
    catch(err) {
        res.status(422).json(err);
    }
}


module.exports = customerController;