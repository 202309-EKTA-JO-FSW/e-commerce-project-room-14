const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin");
const {authenticateAdmin}=require("../middleware/authenticateAdmin");
router.post("/signin",adminController.signin);
router.post("/new-admin",authenticateAdmin,adminController.newAdmin);
router.post("/signout",adminController.signout);
router.delete("/removeItems",authenticateAdmin,adminController.removeItems);
router.get("/searchItems",authenticateAdmin,adminController.searchItems);
router.post('/addItem', authenticateAdmin,adminController.addNewItem);
router.put('/items/:itemId',authenticateAdmin, adminController.updateItemDetails);
router.get("/customers",authenticateAdmin,adminController.getCustomers);
router.get('/orders', authenticateAdmin,adminController.getOrders);



module.exports = router;