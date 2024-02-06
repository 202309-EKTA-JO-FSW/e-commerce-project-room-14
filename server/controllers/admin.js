
const shopItemModel = require("../models/shop-item");


const removeItems = async(req,res)=>
  {
    try {
        const {itemsIds} = req.body;
        if (!itemsIds)
        {
          return res.status(400).json({message:"Invalid Items Id's"})
        }

        const deletedItems = await shopItemModel.deleteMany({_id:{$in : itemsIds }});

        if (deletedItems.deletedCount===0)
        {
          return res.status(404).json({message:"No Item found"})
        }

        return res.status(200).json({message:"Items deleted successfully"})

    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
}

const searchItems=async(req,res)=>
{
    const {title, genre, minPrice, maxPrice}=req.query;
    const query = {};
    if (title)  query.title ={ $regex: new RegExp(title, 'i') };//$regex: Provides regular expression capabilities for pattern matching strings in queries. i: Case-insensitive
    if (genre) query.genre=genre;
    if (minPrice && maxPrice) {
        query.price = { $gte: minPrice, $lte: maxPrice };
      }

    try {
      const items = await shopItemModel.find(query);
      if (items.length > 0){
        res.status(200).json({message:"Search Result",items});
      }
      else  
      {
         res.status(404).json({message:"No Items found"})
      }
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error searching items' });
  }
}


const addNewItem = async (req, res) => {
  try {
      const { title, image, price, description, availableCount, genre } = req.body;
      
      // Check for required fields
      if (!title || !price || !availableCount || !genre) {
          return res.status(400).json({ message: "Title, price, availableCount, and genre are required for a new item" });
      }

      const newItem = new shopItemModel({ title, image, price, description, availableCount, genre });
      await newItem.save();

      return res.status(201).json({ message: "Item added successfully", newItem });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateItemDetails = async (req, res) => {
  try {
    const { itemId } = req.params; 
    const { title, image, price, description, availableCount, genre } = req.body;

    if (!itemId) {
      return res.status(400).json({ message: "Item ID is required" });
    }

    const item = await shopItemModel.findById(itemId);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Update item details
    if (title) item.title = title;
    if (image) item.image = image;
    if (price) item.price = price;
    if (description) item.description = description;
    if (availableCount) item.availableCount = availableCount;
    if (genre) item.genre = genre;

    await item.save();

    return res.status(200).json({ message: "Item details updated successfully", updatedItem: item });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports={removeItems, searchItems, addNewItem, updateItemDetails };



