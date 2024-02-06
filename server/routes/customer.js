const express  = require("express");
const router = express.Router();

const customerController = require("../controllers/customer");

router.get("/customer", customerController.getAllShopItems);
router.get("/customer/filter", customerController.filterItems);
router.get("/customer/search", customerController.searchItems);
router.post("/:id/cart", customerController.addToCart);
router.post("/:id/checkout", customerController.orderAndCheckout);
router.get("/:id/customer", customerController.getOneItem);

module.exports = router;