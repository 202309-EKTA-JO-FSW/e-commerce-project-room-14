const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin");
const {authenticateAdmin}=require("../middleware/authenticateAdmin");

router.post("/signin",adminController.signin);
router.post("/new-admin",adminController.newAdmin);
router.post("/signout",adminController.signout);
router.delete("/removeItems",adminController.removeItems);
router.get("/searchItems",adminController.searchItems);
router.post('/addItem',adminController.addNewItem);
router.put('/items/:itemId', adminController.updateItemDetails);
router.get("/customers",adminController.getCustomers);
router.get('/orders',adminController.getOrders);



module.exports = router;