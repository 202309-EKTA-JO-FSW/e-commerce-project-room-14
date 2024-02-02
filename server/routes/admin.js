const express = require("express");
const router = express.Router();
const adminController=require("../controllers/admin");

router.delete("/removeItems",adminController.removeItems);
module.exports=router;