const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin");

router.post("/signin",adminController.signin)
router.delete("/removeItems",adminController.removeItems);
router.get("/searchItems",adminController.searchItems);
router.post('/addItem', adminController.addNewItem);
router.put('/items/:itemId', adminController.updateItemDetails);


module.exports = router;