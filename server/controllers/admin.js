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

const searchItems=async(req,res)=>
{
    const {title,genre,minPrice, maxPrice}=req.query;
    const query={};
    if (title)  query.title ={ $regex: new RegExp(title, 'i') };//$regex: Provides regular expression capabilities for pattern matching strings in queries. i: Case-insensitive
    if (genre) query.genre=genre;
    if (minPrice && maxPrice) {
        query.price = { $gte: minPrice, $lte: maxPrice };
      }
  try {
    const items=await shopItemModel.find(query);
    if (items.length>0){
    res.status(200).json({message:"Search Result",items});
    }
    elsegit 
    {
         res.status(404).json({message:"No Items found"})
    }
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error searching items' });
  }
}
module.exports={removeItems,searchItems};