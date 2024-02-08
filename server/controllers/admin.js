//hi
const shopItemModel = require("../models/shop-item");
const bcrypt=require ("bcrypt");
const admin=require ("../models/admin");
const customer= require("../models/customer");
const jwt=require("jsonwebtoken");
const signin=async(req,res)=>
{
  const {email,password}=req.body;
  try
  {
    const adminAccount=await admin.findOne({email});
    if (!adminAccount)
    {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    const isValidPass=await bcrypt.compare(password,admin.hashedPassword);
    if (!isValidPass)
    {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    const token=jwt.sign({userId:adminAccount._id,isAdmin: true},process.env.Access_Token_Key,{expiresIn:'24h'});
     res.cookie('jwt', token, { httpOnly: true, maxAge: 86400000 }); // maxAge is in milliseconds (24 hours)
     res.status(200).json({ message: 'Signin successful' });
  }
  catch(error)
  {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
  
}
const newAdmin=async(req,res)=>
{
  const {name,email,password}=req.body;
  try {
    const existAdmin=await shopItemModel.findOne({email});
    if (existAdmin)
    {
      return res.status(400).json({ message: 'Admin already exists' });
    }
    const hashedPassword=await bcrypt.hash(password,10);
    
    const newAdmin=await admin.create({name,email,hashedPassword});
    const token=jwt.sign({userId:adminAccount._id,isAdmin: true},process.env.Access_Token_Key,{expiresIn:'24h'});
    res.cookie('jwt', token, { httpOnly: true, maxAge: 86400000 }); // maxAge is in milliseconds (24 hours)
    res.status(201).json({ message: 'New admin account created successfully' });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }

}
const signout=async(req,res)=>
{
  res.cookie('jwt','',{maxAge:1});
  res.status(200).json({ message: 'Signout successful' });

}
const getCustomers=async(req,res)=>
{
  try {
    const customers=await customer.find({});
    if (!customers || customers.length === 0){
      return res.status(404).json({ message: 'No customers found' });
    
    }
    res.status(200).json(customers);
  } catch (error) {
    console.error(error);
  res.status(500).json({ message: 'Internal server error' });
  }

}
const getOrders=async(req,res)=>
{
  try {
    //populate() method is used to replace the shopItemsRef field in each order with the actual documents from the shop-item collection. 
    const customersWithOrders=await customer.find({},'order').populate('order.shopItemsRef');
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found' });
    }
    const allOrders = customersWithOrders.flatMap(customer => customer.order.map(order => ({
      items: order.shopItemsRef, // order contains an array of shopItem references
      numberOfItems: order.numberOfItems, 
      totalPrice: order.totalPrice,
      date: order.date,
      customerName: customer.name
  })));
  res.status(200).json({ orders: allOrders })
  
  } catch (error) {
    console.error(error);
  res.status(500).json({ message: 'Internal Server Error' });
  }

}
const removeItems = async(req,res)=>
  {
    try {
        const {itemsIds} = req.body;
        if (!itemsIds)
        {
          return res.status(400).json({message:"Invalid Items Id's"})
        }

        const deletedItems = await shopItemModel.deleteMany({_id:{$in : itemsIds }});

        if (deletedItems.deletedCount === 0)
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

module.exports={removeItems, 
  searchItems,
   addNewItem, 
   updateItemDetails,
   signin, 
   newAdmin,
   signout ,
   getCustomers,
   getOrders};



