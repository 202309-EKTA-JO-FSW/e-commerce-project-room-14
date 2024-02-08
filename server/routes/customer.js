const express  = require("express");
const router = express.Router();
const checkBlackListToken = require("../middleware/checkBlackListToken");
const customerModel = require("../models/customer");

const customerController = require("../controllers/customer");

router.post('/signup', customerController.signup);
router.post("/signin", customerController.signin);
router.post("/signout", customerController.signout);

router.get("/", customerController.getAllShopItems);
router.get("/filter", customerController.filterItems);
router.get("/search", customerController.searchItems);

router.post("/:id/cart", customerController.addToCart);
router.post("/:id/checkout", customerController.orderAndCheckout);
router.get("/:id/item", customerController.getOneItem);

router.get("/customers" , getAllCustomers = async (_, res) => {
    const customers = await customerModel.find({});
    res.json(customers);
});


module.exports = router;