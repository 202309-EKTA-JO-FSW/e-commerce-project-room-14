const shopItemModel=require("../models/shop-item");


const removeItems=async(req,res)=>
{
    try {
        const {itemsIds}=req.body;
        if (!itemsIds)
        {
            return res.status(400).json({message:"Invalid Items Id's"})
        }
const deletedItems=await shopItemModel.deleteMany({_id:{$in : itemsIds }});
        if (deletedItems.deletedCount===0)
        {
return res.status(404).json({message:"No Item found"})
        }
        return res.status(200).json({message:"Items deleted successfully"})
    } catch (error) {
         console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
    }
}
module.exports={removeItems};