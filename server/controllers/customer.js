const express = require("express");

const customerModel = require("../models/customer");
const shopItemModel = require("../models/shop-item");

const customerController = {};


// router.get("/customer", customerController.getAllShopItems);
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
            $text: { $search: query }
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
        const { customerId } = req.params;
        const { itemId, quantity } = req.body;

        const customer = await customerModel.findById(customerId);
        const shopItem = await shopItemModel.findById(itemId);

        if(!customer || !shopItem){
            return res.status(404).json({message: "customer or item not found"})
        }

        if( shopItem.availableCount === 0){
            return res.status(422).json({message: "item unavailable (quantity = 0)"});
        }
        else if( quantity < shopItem.availableCount){
            return res.status(422).json({message: `quantity overflows the available items  (available = ${shopItem.availableCount})`});
        }

        customer.cart.shopItemsRef.push(itemId);
        customer.cart.numberOfItems += quantity;
        customer.cart.totalPrice += shopItem.price * quantity;

        await Promise.all([customer.save(), item.save()]);

        res.status(200).json(customer.cart);
    }
    catch (err) {
        res.status.json(err)
    }
}

// router.post("/:id/checkout", customerController.orderAndCheckout);
customerController.orderAndCheckout = async (req, res) => {
    try{
        const { customerId } = req.params;

        const customer = await customerModel.findById(customerId);

        if(!customer){
            return res.status(404).json({message: "customer not found"});
        }

        const orderItems = customer.cart.shopItemsRef.map( item => ({
            title: item.title,
            price: item.price,
        }));

        const totalPrice = customer.cart.totalPrice;

        const order = {
            numberOfItems: customer.cart.numberOfItems,
            totalPrice,
            date: new Date(),
            shopItemsRef: customer.cart.shopItemsRef.map(item => item._id),
        };

        customer.cart.shopItemsRef = [];
        customer.cart.numberOfItems = 0;
        customer.cart.totalPrice = 0;

        customer.order.push(order);

        await customer.save();

        res.status(200).json({ orderItems, totalPrice });
    }
    catch (err) {
        res.status(422).json(err);
    }
}

// router.get("/:id", customerController.getOneItem);
customerController.getOneItem = async (req, res) => {
    try{
        const { itemId } = req.params;

        const item = await shopItemModel.findById(itemId);

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