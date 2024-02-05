const express = require("express");
const router = express.Router();
const adminController=require("../controllers/admin");

router.delete("/removeItems",adminController.removeItems);
router.get("/searchItems",adminController.searchItems);
router.post('/addItem', adminController.addNewItem);
module.exports=router;