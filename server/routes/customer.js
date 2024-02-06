const express  = require("express");
const router = express.Router();

const customerController = require("../controllers/customer");

router.get("/", customerController.getAllShopItems);
router.get("/filter", customerController.filterItems);
router.get("/search", customerController.searchItems);
router.post("/:id/cart", customerController.addToCart);
router.post("/:id/checkout", customerController.orderAndCheckout);
router.get("/:id", customerController.getOneItem);

module.exports = router;